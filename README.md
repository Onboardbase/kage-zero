[![npm version](https://badge.fury.io/js/kagebase.svg)](https://badge.fury.io/js/kagebase)
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

- 🔍 Intelligent project type detection (NextJS, Express, NestJS)
- 🐳 Automated Docker configuration generation
- 🔐 Built-in SSL certificate management with Caddy
- 🌐 Multi-domain support out of the box
- ⚡ Interactive CLI with smart defaults
- 🛠️ Zero-config setup for popular frameworks
- 📦 Development and production ready configurations

## Installation

```bash
npm i -g kagebase
```

### Or using Yarn

```bash
yarn global add kagebase
```

### Or using pnpm

```bash
pnpm i -g kagebase
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

To initialize configuration for your project:

```bash
kage init
```

The CLI will guide you through the following steps:
1. Automatically detect your project type
2. Configure the port for your application
3. Set up your domain name(s)
4. Provide an email for SSL certificates

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
- NextJS (Legacy and Standalone)
- Express (JavaScript and TypeScript)
- NestJS

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
