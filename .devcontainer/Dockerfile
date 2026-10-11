FROM mcr.microsoft.com/devcontainers/javascript-node:5-24-trixie

RUN wget https://github.com/supabase/cli/releases/download/v1.110.1/supabase_1.110.1_linux_amd64.deb \
    && dpkg -i supabase_1.110.1_linux_amd64.deb

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#    && apt-get -y install --no-install-recommends <your-package-list-here>
