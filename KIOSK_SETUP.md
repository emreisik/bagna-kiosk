# Kiosk Setup Guide

## Physical Setup

### Hardware Requirements
- **Display:** 1920x1080 or higher (16:9 aspect ratio recommended)
- **Touch Screen:** Capacitive multi-touch display
- **Computer:** Any modern PC capable of running Chrome/Chromium
- **Internet:** Stable connection for loading product images

### Recommended Specifications
- Display size: 32" - 55" for optimal viewing distance
- Brightness: 350+ cd/m² for well-lit environments
- Response time: <10ms for touch interactions
- Mounting: VESA compatible wall mount or floor stand

## Software Setup

### 1. Operating System Configuration

**Linux (Ubuntu/Debian):**
```bash
# Install Chromium
sudo apt update
sudo apt install chromium-browser unclutter

# Disable screensaver
gsettings set org.gnome.desktop.session idle-delay 0

# Auto-hide mouse cursor
unclutter -idle 0.1 -root &
```

**Windows:**
- Disable Windows Update automatic restart
- Disable screensaver in Power Options
- Set display to never turn off
- Disable Windows lock screen

### 2. Browser Configuration

**Launch in Kiosk Mode:**
```bash
# Development
chromium-browser \
  --kiosk \
  --app=http://localhost:5173 \
  --no-first-run \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-translate

# Production
chromium-browser \
  --kiosk \
  --app=https://yourdomain.com/products \
  --no-first-run \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-translate \
  --check-for-update-interval=31536000
```

### 3. Auto-Start on Boot

**Linux (systemd service):**

Create `/etc/systemd/system/kiosk.service`:

```ini
[Unit]
Description=Kiosk QR Kiosk
After=graphical.target

[Service]
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/kiosk/.Xauthority
Type=simple
User=kiosk
ExecStart=/usr/bin/chromium-browser --kiosk --app=https://yourdomain.com/products --no-first-run --disable-infobars
Restart=always
RestartSec=3

[Install]
WantedBy=graphical.target
```

Enable the service:
```bash
sudo systemctl enable kiosk.service
sudo systemctl start kiosk.service
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start a program
5. Program: `"C:\Program Files\Google\Chrome\Application\chrome.exe"`
6. Arguments: `--kiosk --app=https://yourdomain.com/products`

### 4. Watchdog/Auto-Recovery

Create a script to monitor and restart if crashed:

**Linux (`/usr/local/bin/kiosk-watchdog.sh`):**
```bash
#!/bin/bash
while true; do
  if ! pgrep -x "chromium-browse" > /dev/null; then
    systemctl restart kiosk.service
  fi
  sleep 30
done
```

Make executable and run on boot:
```bash
chmod +x /usr/local/bin/kiosk-watchdog.sh
# Add to crontab: @reboot /usr/local/bin/kiosk-watchdog.sh
```

## Network Configuration

### Remote Management
Enable SSH for remote access:
```bash
sudo apt install openssh-server
sudo systemctl enable ssh
```

### Static IP (recommended)
Configure static IP for reliable network access:

Edit `/etc/netplan/01-netcfg.yaml`:
```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [192.168.1.100/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Apply:
```bash
sudo netplan apply
```

## Security Considerations

### Kiosk Lockdown
- Disable keyboard shortcuts (F11, Alt+F4, Ctrl+W, etc.)
- Block access to system settings
- Use a limited user account
- Disable USB auto-mount (prevents tampering)

**Chrome Policy (Windows Registry):**
```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome]
"DeveloperToolsDisabled"=dword:00000001
"IncognitoModeAvailability"=dword:00000001
"BrowserAddPersonEnabled"=dword:00000000
```

### Physical Security
- Secure the computer in a locked cabinet
- Use tamper-resistant mounting
- Cable management to prevent disconnection
- Consider a UPS for power protection

## Monitoring & Maintenance

### Remote Monitoring
Set up simple health check:

**Endpoint:** `https://yourdomain.com/health`
**Monitor:** Ping every 60 seconds

### Logs
Monitor browser console and system logs:
```bash
# Browser logs (Linux)
~/.config/chromium/Default/chrome_debug.log

# System logs
journalctl -u kiosk.service -f
```

### Scheduled Reboot
Reboot daily during off-hours to clear memory:

```bash
# Crontab entry (reboot at 3 AM)
0 3 * * * /sbin/shutdown -r now
```

## Content Updates

### Product Images
- Optimize images (WebP format, <200KB)
- Use CDN for faster loading
- Implement lazy loading (already enabled)

### Updating Product Data
1. Edit `/src/data/products.ts`
2. Rebuild: `pnpm run build`
3. Deploy updated build
4. Kiosk will auto-refresh on idle or manual touch

### Hot-Reload (Development)
```bash
# Start dev server with network access
pnpm run dev --host

# Access from kiosk
http://[your-dev-machine-ip]:5173
```

## Troubleshooting

### Display Issues
- **Overscan:** Adjust TV/monitor settings to 1:1 pixel mapping
- **Touch not working:** Check USB connection and driver installation
- **Scaling issues:** Set browser zoom to 100%

### Performance
- **Slow loading:** Optimize images, check network speed
- **Memory leaks:** Enable daily auto-reboot
- **Touch lag:** Disable animations in browser flags

### Recovery Mode
If kiosk becomes unresponsive:
1. Connect keyboard
2. Press `Ctrl+Alt+F2` (Linux) to switch to terminal
3. `sudo systemctl restart kiosk.service`
4. Or force reboot: `sudo reboot`

## Best Practices

1. **Test extensively** before production deployment
2. **Monitor remotely** for the first week
3. **Have a backup plan** (spare computer/display)
4. **Document your setup** with photos and notes
5. **Train staff** on basic troubleshooting
6. **Schedule regular maintenance** (weekly/monthly)
7. **Keep content fresh** - update products regularly

## Support

For technical issues or questions, refer to:
- Main README.md
- Browser documentation (Chromium kiosk mode)
- Your IT department or contractor

---

**Last Updated:** February 2026  
**Version:** 1.0
