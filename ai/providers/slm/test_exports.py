from ai.providers.slm import (
    GemmaProvider,
    LlamaProvider,
    MistralProvider,
    PhiProvider,
    QwenProvider,
    SmolLMProvider,
    TinyLlamaProvider,
)


providers = [
    GemmaProvider,
    LlamaProvider,
    MistralProvider,
    PhiProvider,
    QwenProvider,
    SmolLMProvider,
    TinyLlamaProvider,
]

print("SLM EXPORTS: PASS")
print("PROVIDER COUNT:", len(providers))

for provider in providers:
    print(provider.__name__)

assert len(providers) == 7
assert TinyLlamaProvider.__name__ == "TinyLlamaProvider"

print("TINYLLAMA PARENT EXPORT TEST: PASS")
