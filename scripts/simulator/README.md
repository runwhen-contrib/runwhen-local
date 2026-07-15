# Simulator scale-config generator

`generate_scale_config.py` emits an organic, large-scale simulator test config
(clusters → namespaces → resources → one SLX each) consumable by the existing
`src/run.py simulate` command. Used to stress-test platform ingestion with
~100K SLXs in a single upload.

    python scripts/simulator/generate_scale_config.py \
      --count 100000 --clusters 50 --namespaces-per-cluster 20 \
      --seed 1 --sli-ratio 0.25 --slo-ratio 0.10 \
      --output scale-test.yaml

Then feed it to simulate (see docs/user-guide/features/simulator.md):

    cd src && python run.py simulate \
      --config ../scale-test.yaml --upload-info uploadInfo.yaml \
      --base-directory . --upload
