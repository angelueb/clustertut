---
title: "Singularity: Quasi-mapping RNA-Seq quantification"
date: 2023-02-26T15:19:13+01:00
draft: false
weight: 3
---

The use of Singularity containers is supported in the cluster. In contrast to other container technologies, Singularity is a good fit to HPC environments, since:
* Singularity containers don't need administrative privileges to be executed.
* Performance levels are very close to regular binaries.
* Compatibility with Docker images, which enables the use of a huge number of readily available existing containerized tools.
* Container building tools similar to Docker. Users can build custom containers using already acquired general principles.
* Singularity containers mount several common common storage locations, like $HOME. Also, in our cluster they are configured to mount /cscratch automatically.

For these reasons, Singularity is great for running tools on the cluster without having to request the administrators to install them system-wide. Users can simply pull existing images from public repositories, or build their own, and run them as SLURM jobs, in a very similar fashion to running regular binaries.


