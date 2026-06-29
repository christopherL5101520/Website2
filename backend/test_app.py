import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import app


def reset_tracker_state():
    app.active_users.clear()
    app.known_users.clear()
    app.last_seen.clear()
    app.peak_active_users = 0
    app.total_users = 0
    app.total_visits = 0


class TrackerCounterTests(unittest.TestCase):
    def setUp(self):
        reset_tracker_state()
        self.client = app.app.test_client()

    def test_total_users_counts_same_user_once_after_repeated_pings(self):
        self.client.get("/ping/user-1")
        self.client.get("/ping/user-1")

        response = self.client.get("/stats")

        self.assertEqual(response.json["activeUsers"], 1)
        self.assertEqual(response.json["totalUsers"], 1)
        self.assertEqual(response.json["peakActiveUsers"], 1)

    def test_total_users_does_not_increase_when_inactive_user_returns(self):
        self.client.get("/ping/user-1")
        app.active_users.clear()

        self.client.get("/ping/user-1")
        response = self.client.get("/stats")

        self.assertEqual(response.json["activeUsers"], 1)
        self.assertEqual(response.json["totalUsers"], 1)

    def test_total_users_increases_for_different_users(self):
        self.client.get("/ping/user-1")
        self.client.get("/ping/user-2")

        response = self.client.get("/stats")

        self.assertEqual(response.json["activeUsers"], 2)
        self.assertEqual(response.json["totalUsers"], 2)
        self.assertEqual(response.json["peakActiveUsers"], 2)


if __name__ == "__main__":
    unittest.main()
