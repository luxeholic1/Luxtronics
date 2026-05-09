#!/bin/bash

# Hostinger Multi-Domain FTP Configuration Helper
# This script helps you set up FTP credentials for multiple Hostinger domains

echo "🟠 Hostinger Multi-Domain FTP Configuration"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env.local exists
if [[ ! -f ".env.local" ]]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local created from .env.example${NC}"
fi

echo ""
echo "📋 You need to configure FTP credentials for each domain."
echo "Get these from Hostinger hPanel → Hosting → FTP Accounts"
echo ""

# Array of domains
DOMAINS=("US" "AU" "NZ" "IN" "IN_AU" "IN_NZ")
DOMAIN_NAMES=("luxtronics.com" "luxtronics.com.au" "luxtronics.co.nz" "luxtronics.in" "luxtronics.in.au" "luxtronics.in.nz")

for i in "${!DOMAINS[@]}"; do
    domain="${DOMAINS[$i]}"
    domain_name="${DOMAIN_NAMES[$i]}"

    echo -e "${BLUE}Configuring ${domain_name} (${domain}):${NC}"

    # Check if already configured
    if grep -q "FTP_HOST_${domain}=" .env.local; then
        echo -e "${YELLOW}  Already configured. Skip? (y/n): ${NC}"
        read -r skip
        if [[ $skip =~ ^[Yy]$ ]]; then
            continue
        fi
    fi

    echo "  FTP Host (e.g., ftp.${domain_name}):"
    read -r ftp_host
    echo "  FTP User:"
    read -r ftp_user
    echo "  FTP Password:"
    read -r -s ftp_pass
    echo ""
    echo "  FTP Remote Directory (default: /public_html):"
    read -r ftp_remote_dir
    ftp_remote_dir=${ftp_remote_dir:-"/public_html"}

    # Add to .env.local
    cat >> .env.local << EOF

# ${domain_name} (${domain})
FTP_HOST_${domain}=${ftp_host}
FTP_USER_${domain}=${ftp_user}
FTP_PASS_${domain}=${ftp_pass}
FTP_REMOTE_DIR_${domain}=${ftp_remote_dir}
EOF

    echo -e "${GREEN}  ✅ Added configuration for ${domain_name}${NC}"
    echo ""
done

echo -e "${GREEN}🎉 FTP configuration completed!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Test deployment: ./scripts/deploy-multidomain.sh luxtronics.com.au hostinger"
echo "2. Check HOSTINGER_MULTIDOMAIN.md for detailed setup instructions"
echo "3. Point domains to Hostinger nameservers"
echo ""
echo "🔧 To edit configuration later, modify .env.local file directly."