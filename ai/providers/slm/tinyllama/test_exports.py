from ai.providers.slm.tinyllama import (
    TinyLlamaClient,
    TinyLlamaConfig,
    TINYLLAMA_MODEL_DEFINITIONS,
    TINYLLAMA_MODELS,
    TinyLlamaProvider,
    TinyLlamaTokenizer,
)

print("TINYLLAMA EXPORTS: PASS")
print("CLIENT:", TinyLlamaClient.__name__)
print("CONFIG:", TinyLlamaConfig.__name__)
print("MODELS:", len(TINYLLAMA_MODELS))
print("PROVIDER:", TinyLlamaProvider.__name__)
print("TOKENIZER:", TinyLlamaTokenizer.__name__)

assert len(TINYLLAMA_MODELS) == 1
assert TINYLLAMA_MODEL_DEFINITIONS == TINYLLAMA_MODELS

print("TINYLLAMA PACKAGE TEST: PASS")
