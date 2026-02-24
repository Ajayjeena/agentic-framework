"""In-memory policy engine."""

from agent_framework.enterprise.policy import PolicyEngine, PolicyRequest, PolicyResult


class InMemoryPolicyRule:
    def __init__(self, role: str, action: str, allowed: bool, resource: str | None = None):
        self.role = role
        self.action = action
        self.allowed = allowed
        self.resource = resource


class InMemoryPolicyEngine(PolicyEngine):
    def __init__(self, rules: list[InMemoryPolicyRule] | None = None, default_allow: bool = False):
        self._rules = rules or []
        self._default_allow = default_allow

    def add_rule(self, rule: InMemoryPolicyRule) -> None:
        self._rules.append(rule)

    async def evaluate(self, request: PolicyRequest) -> PolicyResult:
        role = request.role or "default"
        for rule in self._rules:
            role_ok = rule.role == "*" or rule.role == role
            action_ok = rule.action == "*" or rule.action == request.action
            resource_ok = rule.resource is None or rule.resource == "*" or (request.resource and rule.resource == request.resource)
            if role_ok and action_ok and resource_ok:
                return PolicyResult(rule.allowed, None if rule.allowed else "Policy denied")
        return PolicyResult(self._default_allow, None if self._default_allow else "No matching policy")
