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

For these reasons, Singularity is great for running tools on the cluster without having to request the administrators to install them system-wide. Users can simply pull existing images from public repositories, or build their own. This simplifies specially the use of tools with complex dependencies, without having to depend on system-wide installations of specific components and versions. Once ready, the containers can be run as SLURM jobs, in a very similar fashion to running regular binaries.


In this example, we will use the latest version of _Salmon_ from a Singularity container to perform a quasi-mapping quantification of the reads that we pre-processed in the previous example.

## Getting a Singularity image

First let's load de Singularity module:

```bash
[angel@avicenna ~]$ module load singularity

```

Next, we need a container image for _Salmon_. The developers maintain an official Docker image, hosted at Docker Hub. Let's use Singularity to get it and convert it to .sif format (the native Singularity format) in just one simple command:

```bash
[angel@avicenna ~]$ singularity pull docker://combinelab/salmon:1.10.0
```

This will download the original image, convert it to .sif format and save it to `salmon_1.10.0.sif` in the current directory:

```bash
-rwxrwxr-x   1 angel angel 42672128 Feb 26 22:00  salmon_1.10.0.sif

```


