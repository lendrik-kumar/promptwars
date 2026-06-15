# Deploying CarbonIQ to AWS EC2

This guide walks you through deploying the CarbonIQ application to an AWS EC2 instance. It assumes you are starting from scratch.

## 1. Provision an EC2 Instance
1. Log into your AWS Console and navigate to the **EC2 Dashboard**.
2. Click **Launch Instance**.
3. **Name**: `CarbonIQ-Production`
4. **AMI**: Select **Ubuntu Server 24.04 LTS** (recommended for best compatibility with our scripts).
5. **Instance Type**: `t2.micro` is sufficient, but `t3.small` is recommended for slightly better build speeds.
6. **Key Pair**: Select or create a key pair so you can SSH into the instance.
7. **Network Settings**:
   - Check **Allow SSH traffic**
   - Check **Allow HTTP traffic from the internet** (Crucial for Port 80)
   - Check **Allow HTTPS traffic from the internet** (For later domain setup)
8. **Launch Instance**.

## 2. Transfer Code to the EC2 Instance
You can either push your code to a private GitHub repository and `git clone` it on the EC2 instance, or copy it directly using `scp`.

To use `scp` from your local machine (replace variables):
```bash
scp -i /path/to/your-key.pem -r /Users/sanketkamboj/Desktop/promptwars ubuntu@<EC2_PUBLIC_IP>:~/promptwars
```

## 3. Run the Deployment Script
1. SSH into your EC2 instance:
```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```
2. Navigate into the project directory:
```bash
cd promptwars
```
3. Open the `.env` file and insert your `GROQ_API_KEY`:
```bash
nano .env
# Edit the file, then press Ctrl+X, then Y, then Enter to save.
```
4. Run the automated deployment script:
```bash
./deploy.sh
```
*Note: If the script complains about permissions, run `chmod +x deploy.sh` first.*

## 4. Verify Deployment
Once the deployment script finishes, open your browser and navigate to:
`http://<EC2_PUBLIC_IP>`

You should see CarbonIQ running perfectly!

---

## 5. Future Steps: Adding a Domain and SSL (HTTPS)

When you are ready to point a custom domain (like `carboniq.com`) to this app:

1. **DNS Setup**: In your domain registrar (GoDaddy, Namecheap, Route53), add an `A Record` pointing to your `<EC2_PUBLIC_IP>`.
2. **Update Nginx**: 
   - Open `nginx/nginx.conf`
   - Change `server_name _;` to `server_name yourdomain.com www.yourdomain.com;`
   - Rebuild the Nginx container: `docker-compose up -d --build nginx`
3. **Add Certbot for SSL**:
   The easiest way to add SSL to Dockerized Nginx is to use Certbot. You can SSH into the EC2 instance and run:
   ```bash
   sudo apt-get install python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
   Certbot will automatically update your Nginx configuration to support HTTPS.
