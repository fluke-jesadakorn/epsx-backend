# Monorepo Dependency Management

## Current Issue
The gateway service is failing to access mongoose dependencies despite:
- Dependencies being present in root package.json
- Dependencies being declared in gateway's package.json
- Services using MongooseModule in their modules

## Analysis
1. Stock service example shows minimalist approach:
```json
{
  "dependencies": {
    "@app/common": "*"
  }
}
```
- Other services successfully use mongoose through @app/common library
- No explicit mongoose dependencies in service packages

## Action Items
1. Improve @app/common Package
- Update common library's package.json to expose core dependencies
- Add main field to properly expose the module
- Consider adding a exports field for better module resolution

2. Service Package Dependencies
- Remove explicit mongoose dependencies from gateway package.json
- Keep dependencies centralized in root package.json
- Let services inherit dependencies through workspaces

3. Future Best Practices
- Document dependency inheritance in monorepo
- Set up dependency validation in CI/CD
- Consider using dependency cruiser for visualization
- Implement automated dependency graph checks

## Implementation Steps
1. Remove direct mongoose dependencies from gateway
2. Verify @app/common exports
3. Ensure proper dependency hoisting through workspaces
4. Test dependency resolution across all services
