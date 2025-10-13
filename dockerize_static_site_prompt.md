You are an expert AI programming assistant. Your task is to add Docker support to the current repository.

Please perform the following steps:

1. **Analyze the repository:** Determine if it is a simple static site or if it has a build process.
2. **Create a `Dockerfile`:**
    * If it's a static site, create a `Dockerfile` that uses a lightweight web server (like `nginx:stable-alpine`) to serve the files.
    * If there's a build process, create a multi-stage `Dockerfile` that first builds the application and then copies the build artifacts to a lightweight server image.
3. **Create a `.dockerignore` file:** Add common files and directories to ignore, such as `.git`, `node_modules`, `Dockerfile`, `.dockerignore`, and any local development configuration files.
4. **Create a GitHub Actions workflow:**
    * Create a new workflow file at `.github/workflows/docker-image.yml`.
    * The workflow should trigger on pushes to the `main` branch.
    * Use the `docker/build-push-action@v3` to build the Docker image and push it to a container registry.
    * The image should be tagged with `latest` and the Git SHA.
    * Use placeholders for the image name (e.g., `your-username/your-repo-name`) and for the registry credentials (e.g., `secrets.DOCKERHUB_USERNAME` and `secrets.DOCKERHUB_TOKEN`).

Please proceed with these changes.
