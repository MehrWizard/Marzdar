from cryptography import x509
from cryptography.hazmat.backends import default_backend
from OpenSSL import crypto


def get_cert_SANs(cert: bytes):
    cert = x509.load_pem_x509_certificate(cert, default_backend())
    san_list = []
    for extension in cert.extensions:
        if isinstance(extension.value, x509.SubjectAlternativeName):
            san = extension.value
            for name in san:
                san_list.append(name.value)
    return san_list


def generate_certificate():
    k = crypto.PKey()
    k.generate_key(crypto.TYPE_RSA, 4096)
    cert = crypto.X509()
    cert.get_subject().CN = "Gozargah"
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(100*365*24*60*60)
    cert.set_issuer(cert.get_subject())
    cert.set_pubkey(k)
    cert.sign(k, 'sha512')
    cert_pem = crypto.dump_certificate(crypto.FILETYPE_PEM, cert).decode("utf-8")
    key_pem = crypto.dump_privatekey(crypto.FILETYPE_PEM, k).decode("utf-8")

    return {
        "cert": cert_pem,
        "key": key_pem
    }


def add_base64_padding(b64_string: str) -> str:
    """Adds missing Base64 padding if necessary."""
    missing_padding = len(b64_string) % 4
    return b64_string + ("=" * (4 - missing_padding)) if missing_padding else b64_string


def get_x25519_public_key(private_key_b64: str) -> str:
    """
    Converts an X25519 private key (URL-safe Base64) into a public key (URL-safe Base64 format).
    """
    import base64
    import binascii
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import x25519

    try:
        private_key_bytes = base64.urlsafe_b64decode(
            add_base64_padding(private_key_b64)
        )
        if len(private_key_bytes) != 32:
            raise ValueError("Invalid private key length. Must be 32 bytes after decoding.")

        private_key = x25519.X25519PrivateKey.from_private_bytes(private_key_bytes)
        public_key = private_key.public_key()
        public_key_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.Raw, format=serialization.PublicFormat.Raw
        )
        return base64.urlsafe_b64encode(public_key_bytes).decode().rstrip("=")
    except (ValueError, binascii.Error) as exc:
        raise ValueError("Invalid private key.") from exc


def generate_x25519_keypair() -> dict:
    """
    Generates an X25519 private and public keypair in URL-safe Base64 format.
    """
    import base64
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import x25519

    private_key = x25519.X25519PrivateKey.generate()
    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_bytes = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.Raw, format=serialization.PublicFormat.Raw
    )
    return {
        "private_key": base64.urlsafe_b64encode(private_bytes).decode().rstrip("="),
        "public_key": base64.urlsafe_b64encode(public_bytes).decode().rstrip("="),
    }
