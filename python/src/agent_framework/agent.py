"""Role / Goal / Backstory (CrewAI-style) agent metadata."""

from pydantic import BaseModel, Field


class AgentProfile(BaseModel):
    """Domain expertise, goal, and backstory for an agent."""

    role: str = Field(..., description="Domain expertise / function of the agent")
    goal: str = Field(..., description="Outcome-focused objectives")
    backstory: str | None = Field(None, description="Context and personality")


class AgentDefinition(BaseModel):
    """Base agent definition: identity + optional profile."""

    id: str
    profile: AgentProfile | None = None
    allow_delegation: bool = False
