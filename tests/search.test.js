const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class FakeClassList {
    constructor(classes = []) {
        this.classes = new Set(classes);
    }

    contains(className) {
        return this.classes.has(className);
    }
}

class FakeElement {
    constructor({ id = "", className = "" } = {}) {
        this.id = id;
        this.className = className;
        this.innerHTML = "";
        this.style = {};
        this.textContent = "";
        this.value = "";
        this.listeners = {};
        this.classList = new FakeClassList(className ? className.split(" ") : []);
    }

    addEventListener(type, handler) {
        this.listeners[type] = this.listeners[type] || [];
        this.listeners[type].push(handler);
    }

    dispatchEvent(event) {
        event.target = event.target || this;
        for (const handler of this.listeners[event.type] || []) {
            handler(event);
        }
    }

    contains(target) {
        return target === this || target?.parentElement === this;
    }

    getAttribute(name) {
        return this[name] || null;
    }

    querySelectorAll(selector) {
        if (selector !== ".search-result-item") {
            return [];
        }

        const matches = [...this.innerHTML.matchAll(/data-slug="([^"]+)">([^<]+)<\/div>/g)];
        return matches.map((match) => {
            const item = new FakeElement({ className: "search-result-item" });
            item.parentElement = this;
            item["data-slug"] = match[1];
            item.textContent = match[2];
            item.getAttribute = (name) => (name === "data-slug" ? item["data-slug"] : null);
            return item;
        });
    }
}

class FakeDocument {
    constructor() {
        this.listeners = {};
        this.body = new FakeElement({ className: "page-home" });
        this.elements = {
            searchInput: new FakeElement({ id: "searchInput", className: "search-input" }),
            searchDropdown: new FakeElement({ id: "searchDropdown", className: "search-dropdown" }),
            activeUsers: new FakeElement({ id: "activeUsers" }),
            totalUsers: new FakeElement({ id: "totalUsers" }),
            peakUsers: new FakeElement({ id: "peakUsers" }),
            totalVisits: new FakeElement({ id: "totalVisits" }),
        };
    }

    getElementById(id) {
        return this.elements[id] || null;
    }

    querySelectorAll() {
        return [];
    }

    addEventListener(type, handler) {
        this.listeners[type] = this.listeners[type] || [];
        this.listeners[type].push(handler);
    }

    dispatchEvent(event) {
        event.target = event.target || this;
        for (const handler of this.listeners[event.type] || []) {
            handler(event);
        }
    }
}

function loadSiteScript() {
    const document = new FakeDocument();
    const location = {
        origin: "http://localhost",
        search: "",
        href: "http://localhost/index.html",
    };
    const window = {
        __TRACKER_API_URL__: "",
        location,
        localStorage: {
            getItem: () => null,
            setItem: () => {},
        },
        crypto: {
            randomUUID: () => "test-visitor",
        },
    };

    const context = {
        console,
        document,
        window,
        location,
        URLSearchParams,
        Math,
        Date,
        setInterval: () => 1,
        fetch: async () => ({
            ok: true,
            json: async () => ({
                activeUsers: 1,
                totalUsers: 2,
                peakActiveUsers: 3,
                visits: 4,
            }),
        }),
        alert: () => {},
    };

    vm.createContext(context);
    const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
    vm.runInContext(script, context, { filename: "script.js" });
    document.dispatchEvent({ type: "DOMContentLoaded" });

    return { document, window };
}

test("homepage search renders matching topics", () => {
    const { document } = loadSiteScript();
    const input = document.getElementById("searchInput");
    const dropdown = document.getElementById("searchDropdown");

    input.value = "chem";
    input.dispatchEvent({ type: "input" });

    assert.equal(dropdown.style.display, "block");
    assert.match(dropdown.innerHTML, /AP Chemistry/);
    assert.doesNotMatch(dropdown.innerHTML, /SAT: Math/);
});

test("homepage search hides the dropdown when the query is cleared", () => {
    const { document } = loadSiteScript();
    const input = document.getElementById("searchInput");
    const dropdown = document.getElementById("searchDropdown");

    input.value = "sat";
    input.dispatchEvent({ type: "input" });
    input.value = "";
    input.dispatchEvent({ type: "input" });

    assert.equal(dropdown.style.display, "none");
    assert.equal(dropdown.innerHTML, "");
});
