# Kagebase

A powerful CLI tool to automate self-hosting configuration for your web applications. `kagebase` simplifies the process of setting up Docker configurations, reverse proxy, and SSL certificates for various types of web applications.

## Features

- 🔍 Automatic project type detection (NextJS, Express, NestJS)
- 🐳 Docker configuration generation
- 🔐 SSL certificate management with Caddy
- 🌐 Multi-domain support
- ⚡ Easy-to-use interactive CLI

## Installation

```bash
npm install -g kagebase
```

## Requirements

- Node.js >= 16.0.0
- Docker and Docker Compose installed on your system

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
- NextJS
- Express (JavaScript)
- Express (TypeScript)
- NestJS

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contributing

We love your input! We want to make contributing to `kage` as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

### Any contributions you make will be under the MIT Software License

When you submit code changes, your submissions are understood to be under the same [MIT License](./LICENSE) that covers the project. Feel free to contact the maintainers if that's a concern.

### Bug Reports

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)