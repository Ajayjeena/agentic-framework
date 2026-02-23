"""In-memory checkpointer."""

from agent_framework.checkpoint import Checkpointer
from agent_framework.thread import ThreadStateSnapshot


class InMemoryCheckpointer(Checkpointer):
    """In-memory checkpointer for development / single-node."""

    def __init__(self) -> None:
        self._store: dict[str, list[ThreadStateSnapshot]] = {}

    async def put(self, snapshot: ThreadStateSnapshot) -> None:
        key = snapshot.thread_id
        if key not in self._store:
            self._store[key] = []
        self._store[key].append(snapshot)

    async def get(self, thread_id: str) -> ThreadStateSnapshot | None:
        list_snapshots = self._store.get(thread_id)
        if not list_snapshots:
            return None
        return list_snapshots[-1]

    async def list_snapshots(self, thread_id: str) -> list[ThreadStateSnapshot]:
        return self._store.get(thread_id, []).copy()

    async def delete(self, thread_id: str, node_id: str | None = None) -> None:
        if node_id is None:
            self._store.pop(thread_id, None)
            return
        list_snapshots = self._store.get(thread_id, [])
        self._store[thread_id] = [s for s in list_snapshots if s.node_id != node_id]
        if not self._store[thread_id]:
            del self._store[thread_id]
