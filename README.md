[![npm version](https://badge.fury.io/js/kage-cli.svg)](https://badge.fury.io/js/kage-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Kage

> A powerful CLI tool that transforms your web applications into self-hostable solutions in minutes. Say goodbye to manual Docker configurations and deployment headaches.

`kage` automates the tedious process of preparing applications for self-hosting by automatically generating Docker configurations, setting up reverse proxies, and managing SSL certificates. Perfect for developers who want to make their applications self-hostable with minimal effort.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Requirements](#requirements)
- [How It Works](#how-it-works)
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Project Type Support](#project-type-support)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🔍 Intelligent project type detection (NextJS, Astro, Nuxt, React, Vite, Vue, Express, NestJS, Hono)
- 🐳 Automated Docker configuration generation for both static and dynamic applications
- 🔐 Built-in SSL certificate management with Caddy
- 🌐 Multi-domain support out of the box
- ⚡ Interactive CLI with smart defaults
- 🛠️ Zero-config setup for popular frameworks
- 📦 Development and production ready configurations
- 🚀 Docker Hub integration for building and pushing images
- 🔧 Automatic port conflict detection and resolution
- 🛡️ Security headers and optimizations pre-configured

## Installation

```bash
npm i -g kage-cli
```

### Or using Yarn

```bash
yarn global add kage-cli
```

### Or using pnpm

```bash
pnpm i -g kage-cli
```

## Requirements

- Node.js >= 16.0.0
- Docker and Docker Compose installed on your system

## How It Works

Kage simplifies the self-hosting process in three easy steps:

1. **Project Analysis**: Scans your project to detect the framework, dependencies, and configuration requirements
2. **Configuration Generation**: Creates optimized Docker configurations and environment files
3. **Deployment Setup**: Sets up reverse proxy with SSL certificates for secure access

## Usage

### Initialization Examples
To initialize configuration for your project:

1. **Basic initialization with interactive prompts**
```bash
kage init
```

2. **For SSR Applications (e.g., Next.js, Nuxt SSR)**
```bash
kage init \
  -n myapp \
  -p 3000 \
  -d myapp.localhost \
  -e admin@example.com
```
3. **For Static Sites (e.g., Astro SSG, Vite)**
```bash
kage init \
  -n my-static-site \
  -o dist \
  -d myapp.localhost \
  -e admin@example.com
```

#### Available options:
```bash
-n, --app-name <name>    Application name (must match "^[a-z0-9][a-z0-9_-]*$")
-p, --port <port>        Port the app should run on
-o, --output-dir <dir>   Build output directory
-d, --domain <domain>    Domain name (e.g., example.com or subdomain.localhost)
-e, --email <email>      Email address for SSL certificates
```

The CLI will guide you through the following steps:
1. Automatically detect your project type
2. Set the port for your application (with framework-specific defaults)
3. Configure the output directory for static sites (default: `dist`)
4. Set up your domain name(s)
5. Provide an email for SSL certificates

### Building Containers

1. **Build locally with interactive prompts**
```bash
kage build
```

2. **Build for Docker Hub with all options specified**
```bash
kage build \
  -t docker-hub \
  -a mydockerhub \
  -i myapp \
  -v latest \
  --push
```

3. **Build locally without prompts**
```bash
kage build --target local
```

4. **Build for Docker Hub with partial options (prompt for missing values)**
```bash
kage build -t docker-hub -a mydockerhub
```

#### Available options:
```bash
-t, --target <target>    Build target (local or docker-hub)
-a, --account <account>  Docker Hub account name
-i, --image <image>      Docker image name
-v, --version <version>  Image version
-p, --push               Push to Docker Hub after build
```

The build command will:
1. Verify Docker is running
2. Check for required configuration files
3. Build containers either locally or for Docker Hub
4. Optionally push to Docker Hub if --push is specified

To start your containerized application:

```bash
kage run
```

This command will:
1. Check for the required Docker configuration files
2. Start all containers defined in your docker-compose.yml
3. Run your application in detached mode (-d flag)

If you haven't run `kage init` yet, the command will prompt you to do so first.

### Generated Files

After running `kage init`, the following files will be created in your project:

```
kage/
├── Dockerfile
├── docker-compose.yml
├── .env
└── caddy_config/
    └── Caddyfile
```

## Configuration Options

During the initialization process, you'll be prompted for:

- **Port**: The port your application should run on (default: 3000)
- **Domain**: Your domain name(s)
  - For local development: Use `*.localhost` (e.g., `app.localhost`)
  - For production: Use your actual domain (e.g., `example.com`)
  - Multiple domains: Separate with commas (e.g., `app1.com, app2.com, www.app1.com`)
- **Email**: Required for SSL certificate generation

## Project Type Support

`kage` currently supports the following project types:
### Server-side Frameworks
- NextJS (Legacy and Standalone)
- Express (JavaScript and TypeScript)
- NestJS
- Nuxt (SSR mode)
- Astro (SSR mode)
- Hono

### Client-side Frameworks (SSG only)
- Astro (SSG mode)
- Nuxt (SSG mode)
- Vite
- Vue
- React

### Important Note for SSG Builds
If you're using a client-side framework or a server-side framework with SSG (Static Site Generation), your build output directory must be named `dist`. This is required for the static site deployment to work correctly with the generated Docker configuration.

## Contributing

We love your input! We want to make contributing to `kage` as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

### Any contributions you make will be under the MIT Software License

When you submit code changes, your submissions are understood to be under the same [FSL-1.1-MIT License](./LICENSE) that covers the project. Feel free to contact the maintainers if that's a concern.

## License

This project is licensed under the FSL-1.1-MIT License - see the [LICENSE](./LICENSE) file for details.

### Bug Reports

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)
