FROM rust:1.45.2 as build

RUN mkdir /holochain

WORKDIR /holochain
ARG REVISION=develop

RUN git clone https://github.com/holochain/holochain.git

RUN cargo install --path holochain/crates/holochain
RUN cargo install --path holochain/crates/dna_util

RUN mkdir /lair
WORKDIR /lair
RUN git clone https://github.com/holochain/lair.git
RUN cargo install --path lair/crates/lair_keystore

FROM rust:1.45.2
COPY --from=build /usr/local/cargo/bin/holochain /usr/local/cargo/bin/holochain
COPY --from=build /usr/local/cargo/bin/dna-util /usr/local/cargo/bin/dna-util
COPY --from=build /usr/local/cargo/bin/lair-keystore /usr/local/cargo/bin/lair-keystore
ENV PATH="/usr/local/cargo/bin:${PATH}"
RUN rustup target add wasm32-unknown-unknown

RUN apt-get update && apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get install -y nodejs
RUN apt-get install libnss3-dev libgtk-3-0 libgbm1 libasound2 libxrandr2 libdrm2 libcups2 libatk-adaptor libx11-xcb1 libxcb-dri3-0 libxcomposite1 libxdamage1 -y
RUN apt remove cmdtest
RUN apt remove yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install -y yarn
RUN apt-get install -y socat

RUN mkdir /builder
RUN mkdir /dev-apps

WORKDIR /builder
ARG BUILDERREV=master

RUN git clone https://github.com/holochain/builder.git .

VOLUME /builder/socket/devConductor/files

RUN ls
RUN yarn install
RUN cd socket & yarn install
VOLUME /builder/socket/node_modules
VOLUME /builder/node_modules
CMD socat tcp-l:44444,fork,reuseaddr tcp:127.0.0.1:44443 & yarn start

# docker run -it --init -v /Users/philipbeadle/holochain/dev-apps:/dev-apps -v /Users/philipbeadle/holochain/builder:/builder -p 5200:5200 -p 44444:44444 -p 45678:45678