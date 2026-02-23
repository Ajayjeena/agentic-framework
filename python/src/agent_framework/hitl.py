"""Human-in-the-loop modes and types."""

from enum import Enum
from typing import Literal


class HumanInTheLoopMode(str, Enum):
    """HITL modes: ALWAYS, TERMINATE, NEVER."""

    ALWAYS = "ALWAYS"
    TERMINATE = "TERMINATE"
    NEVER = "NEVER"


InterceptDecision = Literal["approve", "skip", "terminate", "modify"]


class InterceptContext:
    """Context passed to intercept handler."""

    def __init__(
        self,
        thread_id: str,
        node_id: str,
        step: int,
        state: dict,
        proposed_action: str | None = None,
        proposed_output: object = None,
        timestamp: float = 0,
    ):
        self.thread_id = thread_id
        self.node_id = node_id
        self.step = step
        self.state = state
        self.proposed_action = proposed_action
        self.proposed_output = proposed_output
        self.timestamp = timestamp


class InterceptResponse:
    """User response from intercept."""

    def __init__(
        self,
        decision: InterceptDecision,
        modified_state: dict | None = None,
        reason: str | None = None,
    ):
        self.decision = decision
        self.modified_state = modified_state
        self.reason = reason
