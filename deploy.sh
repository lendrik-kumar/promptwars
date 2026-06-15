#!/bin/bash
set -e

# EC2 Deployment Script for CarbonIQ

echo "🌱 Starting Deployment for CarbonIQ 🌱"

# 1. Update system packages
echo "📦 Updating system packages..."
sudo yum update -y || sudo apt-get update -y

# 2. Install Docker if not installed
if ! command -v docker &> /dev/null
then
    echo "🐳 Installing Docker..."
    # Attempt Amazon Linux / CentOS install
    sudo yum install docker -y || {
        # Attempt Ubuntu / Debian install
        sudo apt-get install docker.io -y
    }
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo "⚠️ Docker installed! You may need to log out and log back in for group changes to take effect."
else
    echo "✅ Docker is already installed."
fi

# 3. Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null
then
    echo "🐙 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose is already installed."
fi

# 4. Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔑 Creating blank .env file. PLEASE EDIT THIS FILE TO ADD YOUR GROQ_API_KEY."
    echo "GROQ_API_KEY=your_api_key_here" > .env
fi

# 5. Build and run the containers
echo "🚀 Building and starting Docker containers..."
sudo docker-compose up -d --build

echo "🎉 Deployment initiated! The app will be available on Port 80 shortly."
echo "   Don't forget to configure your EC2 Security Group to allow inbound traffic on Port 80 (HTTP)!"
