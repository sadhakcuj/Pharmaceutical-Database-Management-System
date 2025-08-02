FROM rust:bullseye

WORKDIR /server

ENV SQLX_OFFLINE=true

COPY . .
ADD docker.env .env

RUN cargo build --release

EXPOSE 8080

ENTRYPOINT [ "target/release/rust-api" ]