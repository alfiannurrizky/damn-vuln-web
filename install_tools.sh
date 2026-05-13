#!/bin/bash

# Exit on error
set -e

echo "[*] Updating system packages..."
sudo apt update
sudo apt install -y ca-certificates curl wget unzip
sudo apt install -y dirsearch sqlmap

if ! command -v docker &> /dev/null; then
    echo "[*] Installing Docker..."
    # Add Docker's official GPG key:
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: \$(. /etc/os-release && echo "\${UBUNTU_CODENAME:-\$VERSION_CODENAME}")
Components: stable
Architectures: \$(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    echo "[*] Ensuring Docker service is running..."
    sudo systemctl enable docker
    sudo systemctl start docker

    # Optional: Add current user to docker group (requires logout/login to take effect fully)
    sudo usermod -aG docker \$USER
else
    echo "[*] Docker is already installed. Skipping Docker installation."
fi

echo "[*] Installing Golang..."
# Menggunakan versi 1.22.3 karena 1.26.3 belum rilis (mencegah error 404 Not Found)
GO_VERSION="1.22.3"
wget "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" -O /tmp/go.tar.gz
sudo rm -rf /usr/local/go 
sudo tar -C /usr/local -xzf /tmp/go.tar.gz
rm /tmp/go.tar.gz

# Menambahkan Go ke PATH user di .bashrc jika belum ada
if ! grep -q "/usr/local/go/bin" ~/.bashrc; then
    echo 'export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin' >> ~/.bashrc
fi

# Load PATH sementara untuk instalasi Nuclei di sesi ini
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin

echo "[*] Verifying Go installation..."
go version

echo "[*] Installing Nuclei..."
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

echo "[*] Copying Nuclei binary to /usr/bin..."
sudo cp \$HOME/go/bin/nuclei /usr/bin/nuclei

echo "[*] Verifying Nuclei installation..."
nuclei -version

echo "[*] Updating Nuclei templates..."
nuclei -update-templates

echo "[*] Setting up WPScan via Docker..."
# Pull image docker wpscan
sudo docker pull wpscanteam/wpscan

# Membuat wrapper script agar wpscan bisa dijalankan selayaknya command biasa
echo "[*] Creating WPScan wrapper command..."
sudo tee /usr/local/bin/wpscan > /dev/null << 'EOF'
#!/bin/bash
# Menjalankan wpscan melalui docker container
docker run -it --rm wpscanteam/wpscan "$@"
EOF

sudo chmod +x /usr/local/bin/wpscan

echo "=========================================================="
echo "Instalasi Selesai!"
echo ""
echo "- Docker & Docker Compose: Terinstall"
echo "- Golang: $(go version)"
echo "- Nuclei: Terinstall di $HOME/go/bin/nuclei"
echo "- WPScan: Terinstall via docker (bisa langsung ketik 'wpscan' di terminal)"
echo "- Dirsearch & SQLMap: Terinstall"
echo ""
echo "PENTING:"
echo "Jalankan command ini agar command 'go', 'nuclei', dan permission docker langsung aktif di terminal ini:"
echo "  source ~/.bashrc && su - \$USER"
echo "=========================================================="
