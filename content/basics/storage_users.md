---
title: "Storage available to users"
date: 2023-02-26T15:19:13+01:00
draft: false
weight: 2
---

Please, keep in mind that the cluster is a computing system, not a storage-oriented system. The storage capacity of the cluster should be only used for purposes directly related to running computing jobs. This means that, in general, you should use only the amount of storage you need for running your computing jobs, and only during the period of time you (reasonably) need to run them. For instance, the cluster is not intended to be used as a long term storage of your data or serve as a backup system of any kind for your data.

There are two main storage systems available to users in the cluster, /home and /cscratch. Since their purposes are rather different, it is important that you understand which one you should be using, depending on the amount and kind of your data.

In short, `/cscratch` is intended as a temporary storage for the input and output data of your computing jobs in the cluster. As such, you should use it only for the period you need to run the related specific jobs, and remove the data as soon as it's not needed anymore (that is, not consumed as input or produced as output).

`/home/<yourusername>`
: You will be given a /home directory when your account is created, and when you log in to the cluster this will be your default directory. This storage is mainly intended for storing relatively small files such as script files, source code, software files (like binaries, conda environments, singularity images, ...), and other small to medium files that you need for your work on the cluster. While it is not meant to be as temporary as `/cscratch`, the storage amount available is limited on a per user basis. Administrators will monitor the `/home` disk usage, and may impose quotas depending on the storage availability.

`/cscratch/<yourusername>`
: You will be given a /cscratch directory when your account is created. `/cscratch` is a shared space for all users. It’s designed to hold the application data that is being used (input) or produced (output) during an actual HPC operation (running a computing job). You should run your jobs using input data from your `/cscratch` directory, and direct your output files to your `/cscratch` directory. Once your computing jobs are not using or producing a set of specific data from your `/cscratch` directory anymore, it should be moved as soon as possible to your local device and removed from the cluster. Administrators may impose automatic purge of data older than a certain threshold depending on the storage usage.

Note that the access to your `/cscratch/<yourusername>` directory is restricted by default to only you. This means that other users can not access any data you store in your `/cscratch` directory. But, since this directory is owned by you, you can change these restrictions if you wish, using the `chmod` command. In case you need more specific sharing permissions or you need assistance, contact the administrators. 