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

RUN mkdir /home/docker/builder-organisations
VOLUME /home/docker/builder-organisations
VOLUME /home/docker/builder
WORKDIR /home/docker/builder
RUN . /home/docker/.nix-profile/etc/profile.d/nix.sh; nix-shell https://nightly.holochain.love --run "echo holochain -V";
CMD socat tcp-l:26971,fork,reuseaddr tcp:127.0.0.1:26970 & socat tcp-l:11380,fork,reuseaddr tcp:127.0.0.1:11381 & socat tcp-l:22670,fork,reuseaddr tcp:127.0.0.1:22669 & socat tcp-l:22800,fork,reuseaddr tcp:127.0.0.1:22799 & . /home/docker/.nix-profile/etc/profile.d/nix.sh; nix-shell https://nightly.holochain.love --run "yarn install && yarn start"

# docker build -t holochain:builder .
# docker run -it --init -p 5200:5200 -p 44444:44444 -p 45678:45678 -p 26970:26972 holochain:builder

# docker run -it --init -v /Users/philipbeadle/holochain/first-agent/builder-organisations:/home/docker/builder-organisations -v /Users/philipbeadle/holochain/first-agent/builder:/home/docker/builder -p 22670:22670 -p 22800:22800 -p 5200:5200 -p 11380:11380 -p 45678:45678 -p 26971:26971 -p 44001:44001 -p 44002:44002 -p 44003:44003 -p 44004:44004 holochain:builder

# docker run -t -i --privileged holochain:builder bash
# docker stop $(docker ps -a -q)   
# docker rm $(docker ps -a -q) 
# docker rmi $(docker images -a -q)