from ai.providers.slm.tinyllama.provider import TinyLlamaProvider


provider = TinyLlamaProvider()

print("TINYLLAMA PROVIDER IMPORT: PASS")
print("NAME:", provider.name)
print("PROVIDER:", provider.config.provider_id)
print("INITIALIZED:", provider.initialized)

assert provider.name == "TinyLlama"
assert provider.config.provider_id == "tinyllama"
assert provider.initialized is False

print("TINYLLAMA PROVIDER TEST: PASS")
