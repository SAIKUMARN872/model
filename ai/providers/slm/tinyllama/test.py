from ai.providers.slm.tinyllama.models import (
    TINYLLAMA_MODELS,
)


print("MODEL COUNT:", len(TINYLLAMA_MODELS))

for model in TINYLLAMA_MODELS:
    print(
        model.id,
        "|",
        model.tier.value,
        "|",
        model.context_window,
        "|",
        model.quality_score,
    )

assert len(TINYLLAMA_MODELS) == 1

model = TINYLLAMA_MODELS[0]

assert model.id == "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
assert model.provider == "tinyllama"
assert model.tier.value == "slm"
assert model.context_window == 2048
assert model.quality_score == 0.80

print("TINYLLAMA MODELS TEST: PASS")
