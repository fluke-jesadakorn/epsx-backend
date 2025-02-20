# Shared Dependencies in Monorepo

## Package Management Strategy

1. Root-level Dependencies
   - Core packages like `@nestjs/mongoose` and `mongoose` should be declared in the root `package.json`
   - These packages are shared across all workspace packages through Bun/npm workspaces

2. Common Library (`@app/common`)
   - Should declare shared packages as `peerDependencies`
   - This indicates that these dependencies should be available from the root project
   - Example peer dependencies:
     ```json
     {
       "peerDependencies": {
         "@nestjs/mongoose": "^11.0.1",
         "mongoose": "^8.10.0"
       }
     }
     ```

3. Service Packages (gateway, ai-service, etc.)
   - Should rely on root-level dependencies when possible
   - Only declare service-specific dependencies in their individual package.json files
   - Example service dependencies:
     ```json
     {
       "dependencies": {
         "@app/common": "*",
         "@nestjs/terminus": "^11.0.0"
       }
     }
     ```

## Benefits
- Reduces duplicate dependencies
- Ensures consistent versions across services
- Simplifies dependency management
- Reduces bundle size
- Prevents version conflicts

## Future Considerations
- Consider using package.json scripts for dependency management automation
- Set up dependency update automation (e.g., Dependabot)
- Implement stricter peer dependency checks
