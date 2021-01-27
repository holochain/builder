# keep this in sync with Dockerfile.debian
FROM ubuntu:xenial

# @see
# https://github.com/TerrorJack/pixie/blob/master/.circleci/debian.Dockerfile
# https://github.com/NixOS/nix/issues/971#issuecomment-489398535

# linux docker does not ship with much
RUN apt-get update
RUN apt-get install -y sudo xz-utils curl socat

# nix does not work under root
# add a docker user that can sudo
RUN adduser --disabled-password --gecos '' docker
RUN adduser docker sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# nix expects the nixbld group
RUN addgroup --system nixbld
RUN adduser docker nixbld

# keep this matching nix-shell!
ENV NIX_PATH nixpkgs=channel:nixos-19.09

# sandbox doesn't play nice with ubuntu (at least in docker)
RUN mkdir -p /etc/nix && echo 'sandbox = false' > /etc/nix/nix.conf

# use the docker user
USER docker
ENV USER docker
WORKDIR /home/docker

# https://nixos.wiki/wiki/Nix_Installation_Guide#Single-user_install
RUN sudo install -d -m755 -o $(id -u) -g $(id -g) /nix
RUN curl -L https://nixos.org/nix/install | sh

# warm nix and avoid warnings about missing channels
# https://github.com/NixOS/nixpkgs/issues/40165
# RUN . /home/docker/.nix-profile/etc/profile.d/nix.sh; nix-channel --update; nix-shell https://nightly.holochain.love --run echo;

RUN mkdir /home/docker/builder
VOLUME /home/docker/builder
RUN mkdir /home/docker/dev-apps
VOLUME /home/docker/dev-apps
WORKDIR /home/docker/builder
RUN curl -sL https://github.com/holochain/builder/archive/master.tar.gz > master.tar.gz && tar zxvf master.tar.gz -C . && cp -R builder-master/* . && rm -rf builder-master && rm master.tar.gz && ls
RUN . /home/docker/.nix-profile/etc/profile.d/nix.sh; nix-shell https://nightly.holochain.love --run "yarn install && cd socket && yarn install";
CMD . /home/docker/.nix-profile/etc/profile.d/nix.sh; nix-shell https://nightly.holochain.love --run "yarn start"

# 
# docker run -it --init -v /Users/philipbeadle/holochain/dev-apps-docker:/home/docker/dev-apps -v /Users/philipbeadle/holochain/builder-docker:/home/docker/builder -p 5200:5200 -p 44444:44444 -p 45678:45678 -p 26970:26972 holochain:builder