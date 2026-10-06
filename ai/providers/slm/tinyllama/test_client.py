from ai.providers.slm.tinyllama.client import TinyLlamaClient


client = TinyLlamaClient()

print("TINYLLAMA CLIENT IMPORT: PASS")
print("PROVIDER:", client.config.provider_id)
print("LOADED:", client.loaded)
print("MODEL:", client.model_id)

assert client.config.provider_id == "tinyllama"
assert client.loaded is False
assert client.model_id is None

print("TINYLLAMA CLIENT TEST: PASS")
