from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from base58 import b58encode, b58decode
from keys import *


def aes_encrypt(key, iv, plaintext):
    cipher = AES.new(key, AES.MODE_GCM, iv)
    ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))
    return b58encode(ciphertext)

def aes_decrypt(key, iv, ciphertext):
    cipher = AES.new(key, AES.MODE_GCM, iv)
    decrypted_data = cipher.decrypt(b58decode(ciphertext))
    return unpad(decrypted_data, AES.block_size)

def query_id_dec(query_id: str):
    dec_data = aes_decrypt(KEY, IV, query_id).decode("utf8").split("|")
    if len(dec_data) != 2:
        raise RuntimeError("Invalid query_id")
    uid, did = dec_data
    return int(uid), did  # uid, did

def query_id_enc(uid, did):
    return aes_encrypt(KEY, IV, f"{uid}|{did}".encode("utf8")).decode("utf8")
