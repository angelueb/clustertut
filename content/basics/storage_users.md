---
title: "Storage available to users"
date: 2023-02-26T15:19:13+01:00
draft: false
weight: 2
---

Please, keep in mind that the cluster is a computing system, not a storage-oriented system. The storage capacity of the cluster should be only used for purposes directly related to running computing jobs. This means that, in general, you should use only the amount of storage you need for running your computing jobs, and only during the period of time you (reasonably) need to run them. For instance, the cluster is not intended to be used as a long term storage of your data or serve as a backup system of any kind for your data.

There are two main storage systems available to users in the cluster, /home and /cscratch. Since their purposes are rather different, it is important that you understand which one you should be using, depending on the amount and kind of your data.

In short, /cscratch is intended as a temporary storage for the input and output data of your computing jobs in the cluster. As such, you should use it only for the period you need to run the related specific jobs, and remove the data as soon as it's not needed anymore (that is, not consumed as input or produced as output).

`/home/<yourusername>`
: You are given a /home directory automatically when your Discovery account is created. This storage is mainly intended for storing relatively small files such as script files, source code, software installation files, and other small files that you need for your work on Discovery. While it is permanent storage that is backed up and replicated, it is not performant storage. It also has a small quota, so you should frequently check your space usage (use a command such as du -h /home/<yourusername> where <yourusername> is your user name, to see the total space usage). For running jobs and directing output files, you should use your /scratch directory.

`/cscratch/<yourusername>`
: You are given a /scratch directory automatically when your Discovery account is created. Scratch is a shared space for all users. The total storage available is 1.8PB; however, while this is performant storage, it is for temporary use only. It is not backed up. Data on /scratch should be moved as soon as possible to another location for permanent storage. You should run your jobs from /scratch and direct your output files to your /scratch directory for best performance, but it is best practice to move your files off of scratch to avoid any potential data loss.