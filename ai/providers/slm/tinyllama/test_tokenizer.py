from ai.providers.slm.tinyllama.tokenizer import TinyLlamaTokenizer

tokenizer = TinyLlamaTokenizer()

print("TINYLLAMA TOKENIZER IMPORT: PASS")
print("CLASS:", type(tokenizer).__name__)
print("LOADED:", tokenizer.loaded)

assert type(tokenizer).__name__ == "TinyLlamaTokenizer"
assert tokenizer.loaded is False

print("TINYLLAMA TOKENIZER TEST: PASS")
