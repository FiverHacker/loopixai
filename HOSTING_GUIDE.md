# Loopix AI - VPS Hosting Guide

## Prerequisites

- A VPS running **Ubuntu 20.04+** or **Debian 11+**
- A domain name pointing to your VPS IP
- SSH access to your VPS
- Node.js 18+ and npm installed

---

## Step 1: Connect to your VPS

```bash
ssh user@your-vps-ip
```

## Step 2: Install Node.js (if not installed)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # verify
npm -v    # verify
```

## Step 3: Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 4: Upload the project

Run this **from your local machine** (not the VPS):

```bash
scp -r "C:\Users\loopix\Desktop\loopix chat\loopix-ai" user@your-vps-ip:/home/user/loopix-ai
```

Or if you have Git set up:

```bash
# On your VPS:
git clone https://github.com/yourusername/loopix-ai.git
```

## Step 5: Install project dependencies

```bash
cd /home/user/loopix-ai/server
npm install

cd /home/user/loopix-ai/client
npm install
```

## Step 6: Build the React frontend

```bash
cd /home/user/loopix-ai/client
npm run build
```

This creates the `dist/` folder that the server will serve.

## Step 7: Install PM2 (process manager)

```bash
sudo npm install -g pm2
```

## Step 8: Start the server with PM2

```bash
cd /home/user/loopix-ai/server
pm2 start index.js --name loopix-ai
pm2 save
```

## Step 9: Configure PM2 to auto-start on reboot

```bash
pm2 startup
```

Run the command it outputs (usually something like `sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u user --hp /home/user`).

## Step 10: Configure Nginx as a reverse proxy

Create the Nginx config:

```bash
sudo nano /etc/nginx/sites-available/loopix-ai
```

Paste this (replace `your-domain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /home/user/loopix-ai/server/uploads/;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/loopix-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 11: Enable HTTPS with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Follow the prompts. Certbot will auto-renew certificates.

## Step 12: Verify everything is running

```bash
pm2 status
sudo systemctl status nginx
```

Visit `https://your-domain.com` in your browser.

## Step 13: Login

Default admin credentials:
- **Email:** `admin@loopix.ai`
- **Password:** `admin123`

**Change the password immediately after first login.**

---

## Useful PM2 Commands

| Command | Description |
|---|---|
| `pm2 status` | List all processes |
| `pm2 logs loopix-ai` | View live logs |
| `pm2 restart loopix-ai` | Restart the server |
| `pm2 stop loopix-ai` | Stop the server |
| `pm2 delete loopix-ai` | Remove from PM2 |

## Useful Nginx Commands

| Command | Description |
|---|---|
| `sudo nginx -t` | Test config syntax |
| `sudo systemctl reload nginx` | Reload config |
| `sudo systemctl restart nginx` | Restart Nginx |
| `sudo certbot renew --dry-run` | Test SSL renewal |

---

## Updating the App

```bash
cd /home/user/loopix-ai
git pull                              # pull new code (or re-upload)
cd server && npm install              # update server deps
cd ../client && npm install && npm run build  # rebuild client
pm2 restart loopix-ai                 # restart server
```
