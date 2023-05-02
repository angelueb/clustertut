var relearn_search_index = [
  {
    "content": "Getting an account You must first have an account before you can access the cluster. Please contact the administrators for detailed information on how to get your account. If you are eligible, you will receive the specific details to access the cluster, including your username and password.\nConnecting to the cluster Once you have your account ready, you will need a secure shell program to log in to the cluster. Keep in mind that ssh based connections are needed both for console (command-line) and for file transfer sessions.\nIf you are on a Mac or linux machine, you already have a command line ssh client available on your system. Recent versions of Windows can also use the Windows Linux Subsystem to get a command-line ssh client. Alternatively, there are free and open-source graphical ssh clients available (for instance, PuTTY for Windows).\nPlease note that regardless your ssh client, once you connect to the cluster you’ll be in a linux command-line environment, from which you’ll submit your computing jobs. This means you need a minimum working knowledge of the linux command-line shell environment (which is bash by default).\nAs for file transfer, as noted above, an ssh-based connection is needed, and you can perform file transfers from your workstation to the cluster using any tool that let you establish an ssh connection. For instance, scp on you command line, or FileZilla if you prefer a graphical interface program.\n",
    "description": "",
    "tags": null,
    "title": "Accessing the cluster",
    "uri": "/clustertut/basics/connecting/index.html"
  },
  {
    "content": "Here we’ll explain some basics ;l\n",
    "description": "",
    "tags": null,
    "title": "Basics",
    "uri": "/clustertut/basics/index.html"
  },
  {
    "content": "We will explain in a simple way the following cases:\nUsing pre-installed software. As an example, we will be performing some Quality Control steps for RNA-Seq raw data. Using Singularity containers. As an example we’ll use the pre-processed RNA-Seq data from the previous example, to perform a quasi-mapping quantification. Using conda to set up a deep learning landmark detection tool on clinical images, which will run on GPUs ",
    "description": "",
    "tags": null,
    "title": "Practical Examples",
    "uri": "/clustertut/practical-examples/index.html"
  },
  {
    "content": "Pre-installed software: RNA-Seq QC\n",
    "description": "",
    "tags": null,
    "title": "Pre-installed software: RNA-Seq QC",
    "uri": "/clustertut/practical-examples/example_pre-installed/index.html"
  },
  {
    "content": "Please, keep in mind that the cluster is a computing system, not a storage-oriented system. The storage capacity of the cluster should be only used for purposes directly related to running computing jobs. This means that, in general, you should use only the amount of storage you need for running your computing jobs, and only during the period of time you (reasonably) need to run them. For instance, the cluster is not intended to be used as a long term storage of your data or serve as a backup system of any kind for your data.\nThere are two main storage systems available to users in the cluster, /home and /cscratch. Since their purposes are rather different, it is important that you understand which one you should be using, depending on the amount and kind of your data.\nIn short, /cscratch is intended as a temporary storage for the input and output data of your computing jobs in the cluster. As such, you should use it only for the period you need to run the related specific jobs, and remove the data as soon as it’s not needed anymore (that is, not consumed as input or produced as output).\n/home/\u003cyourusername\u003e You will be given a /home directory when your account is created, and when you log in to the cluster this will be your default directory. This storage is mainly intended for storing relatively small files such as script files, source code, software files (like binaries, conda environments, singularity images, …), and other small to medium files that you need for your work on the cluster. While it is not meant to be as temporary as /cscratch, the storage amount available is limited on a per user basis. Administrators will monitor the /home disk usage, and may impose quotas depending on the storage availability. /cscratch/\u003cyourusername\u003e You will be given a directory in /cscratch when your account is created. /cscratch is a shared space for all users. It’s designed to hold the application data that is being used (input) or produced (output) during an actual HPC operation (running a computing job). You should run your jobs using input data from your /cscratch directory, and direct your output files to your /cscratch directory. Once your computing jobs are not using a set of data from your /cscratch or producing data into it anymore, this specific data should be moved as soon as possible to your local device and removed from the cluster. Administrators may impose automatic purges of data older than a certain threshold depending on the storage usage. Note that the access to your /cscratch/\u003cyourusername\u003e directory is restricted by default to only you. This means that other users can not access any data you store in your /cscratch directory. But, since this directory is owned by you, you can change these restrictions if you wish, using the chmod command. In case you need more specific sharing permissions or some assistance, please contact the administrators.\n",
    "description": "",
    "tags": null,
    "title": "Storage available to users",
    "uri": "/clustertut/basics/storage_users/index.html"
  },
  {
    "content": "The use of Singularity containers is supported in the cluster. In contrast to other container technologies, Singularity is a good fit to HPC environments, since:\nSingularity containers don’t need administrative privileges to be executed. Performance levels are very close to regular binaries. Compatibility with Docker images, which enables the use of a huge number of readily available existing containerized tools. Container building tools similar to Docker. Users can build custom containers using already acquired general principles. Singularity containers mount several common common storage locations, like $HOME. Also, in our cluster they are configured to mount /cscratch automatically. One of the main aims and uses of Singularity is to bring containers and reproducibility to scientific computing and high-performance computing (HPC)1\nFor these reasons, Singularity is great for running tools on the cluster without having to request the administrators to install them system-wide. Users can simply pull existing images from public repositories, or build their own. This simplifies the use of tools with complex dependencies in particular, without having to rely on system-wide installations of specific components and versions. In addition, containers enable an easier reproducibility control, given that the gathering and building of the components can be registered systematically. Once ready, the containers can be run as SLURM jobs, in a very similar fashion to running regular binaries.\nIn this example, we will use the latest version of Salmon from a Singularity container to perform a quasi-mapping quantification of the reads that we pre-processed in the previous example.\nGetting a Singularity image First let’s load the Singularity module:\n[angel@avicenna ~]$ module load singularity Next, we need a container image for Salmon. The developers maintain an official Docker image, hosted at Docker Hub. Let’s use Singularity to fetch it and convert it to .sif format (the native Singularity format) in just one simple command:\n[angel@avicenna ~]$ singularity pull docker://combinelab/salmon:1.10.0 This will download the original image, convert it to .sif format and save it to salmon_1.10.0.sif in the current directory:\n-rwxrwxr-x 1 angel angel 42672128 Feb 26 22:00 salmon_1.10.0.sif Info The Biocontainers project provides free and readily available containers for thousands of bioinformatics tools. You can get their Docker images directly from their Quay.io space. For instance:\n[angel@avicenna ~]$ singularity pull docker://quay.io/biocontainers/bowtie2:2.5.1--py310h8d7afc0_0 Also, the Galaxy Project (both projects are related) maintains a repository containing all the Biocontainers images already converted to the Singularity native format. For instance:\n[angel@avicenna ~]$ singularity pull https://depot.galaxyproject.org/singularity/bowtie2:2.5.1--py310h8d7afc0_0 Getting our transcriptome We could automate the following steps but for clarity we are goint to show them as done manually.\nDownload Rat cDNA (doesn’t contain ncRNA sequences):\n[angel@avicenna dades]$ wget ftp://ftp.ensembl.org/pub/release-101/fasta/rattus_norvegicus/cdna/Rattus_norvegicus.Rnor_6.0.cdna.all.fa.gz Download Rat ncRNA:\n[angel@avicenna dades]$ wget ftp://ftp.ensembl.org/pub/release-101/fasta/rattus_norvegicus/ncrna/Rattus_norvegicus.Rnor_6.0.ncrna.fa.gz Concatenate both files into a single compressed fasta:\n[angel@avicenna dades]$ zcat Rattus_norvegicus.Rnor_6.0.cdna.all.fa.gz Rattus_norvegicus.Rnor_6.0.ncrna.fa.gz \u003eRattus_norvegicus.Rnor_6.0.cdna.ncrna.fa.gz We also download the gene annotations (both coding and non coding RNA):\n[angel@avicenna dades]$ wget ftp://ftp.ensembl.org/pub/release-102/gtf/rattus_norvegicus/Rattus_norvegicus.Rnor_6.0.102.gtf.gz Building indices with Salmon We can now use Salmon to build the transcriptome indices which we’ll be using later for our quasi-mapping quantification. Let’s prepare a file for sbatch:\n#!/bin/bash ##This is a good example of a single-process multi-threaded job #SBATCH -p regular # partition name #SBATCH -c 8 # number of cores or threads requested #SBATCH --mem 10G # RAM requested #SBATCH --job-name salmon-index01 # Job name #SBATCH -o job.%j.out # File to which standard out will be written #SBATCH -e job.%j.err # File to which standard err will be written ## Base directory for job input and output data (on /cscratch) TUTORIAL=/cscratch/angel/tutorial ## Input, output variables TRANSCRFN=${TUTORIAL}/dades/Rattus_norvegicus.Rnor_6.0.cdna.ncrna.fa.gz INDEXFN=${TUTORIAL}/dades/Rattus_norvegicus.Rnor_6.0.cdna.ncrna_index ## Run Salmon for creating the index ./salmon_1.10.0.sif salmon index --threads 8 -t $TRANSCRFN -i $INDEXFN As you can see it’s a pretty simple batch submission file. Let’s submit it to SLURM:\n[angel@avicenna ~]$ sbatch salmon_index.run Submitted batch job 67 Let’s check the queues:\n[angel@avicenna ~]$ squeue -u angel -o \"%.13i %.6u %.9P %.8j %.8T %.6M %.12l %.5C %.10R\" JOBID USER PARTITION NAME STATE TIME TIME_LIMIT CPUS NODELIST(REASON) 67 angel regular salmon-i RUNNING 0:03 1-00:00:00 8 c01 After the job finishes, we have our indices created:\n[angel@avicenna ~]$ cd /cscratch/angel/tutorial/dades/Rattus_norvegicus.Rnor_6.0.cdna.ncrna_index/ [angel@avicenna Rattus_norvegicus.Rnor_6.0.cdna.ncrna_index]$ ls complete_ref_lens.bin duplicate_clusters.tsv pos.bin refAccumLengths.bin refseq.bin ctable.bin info.json pre_indexing.log ref_indexing.log seq.bin ctg_offsets.bin mphf.bin rank.bin reflengths.bin versionInfo.json Quasi-mapping quantification Now that our indices are ready, we can proceed to run Salmon in mapping-based mode to obtain a quasi-mapping quantification.\nSince our input reads are paired-end ones, we have a pair of files per each sample. We are going to use the SLURM’s Job Array feature to automatically submit all the required Salmon tasks for execution (taking advantage of the serialized sample prefix of the files’ names).\nLet’s remember this naming pattern of the input files:\n[angel@avicenna ~]$ ls /cscratch/angel/tutorial/dades/cutadapt_results/ 1244_lib_09628AAB_ATCACG_1_TRIM.fastq.gz 1260_lib_09637AAB_TAGCTT_2_TRIM.fastq.gz 1244_lib_09628AAB_ATCACG_2_TRIM.fastq.gz 1261_lib_09638AAB_GGCTAC_1_TRIM.fastq.gz 1245_lib_09641AAB_ATGTCA_1_TRIM.fastq.gz 1261_lib_09638AAB_GGCTAC_2_TRIM.fastq.gz 1245_lib_09641AAB_ATGTCA_2_TRIM.fastq.gz 1262_lib_09656AAB_CCAACA_1_TRIM.fastq.gz 1246_lib_09629AAB_CGATGT_1_TRIM.fastq.gz 1262_lib_09656AAB_CCAACA_2_TRIM.fastq.gz 1246_lib_09629AAB_CGATGT_2_TRIM.fastq.gz 1263_lib_09639AAB_CTTGTA_1_TRIM.fastq.gz 1247_lib_09648AAB_AGTTCC_1_TRIM.fastq.gz 1263_lib_09639AAB_CTTGTA_2_TRIM.fastq.gz 1247_lib_09648AAB_AGTTCC_2_TRIM.fastq.gz 1264_lib_09657AAB_CGGAAT_1_TRIM.fastq.gz 1248_lib_09649AAB_GGTAGC_1_TRIM.fastq.gz 1264_lib_09657AAB_CGGAAT_2_TRIM.fastq.gz 1248_lib_09649AAB_GGTAGC_2_TRIM.fastq.gz 1265_lib_09640AAB_AGTCAA_1_TRIM.fastq.gz 1249_lib_09630AAB_TTAGGC_1_TRIM.fastq.gz 1265_lib_09640AAB_AGTCAA_2_TRIM.fastq.gz 1249_lib_09630AAB_TTAGGC_2_TRIM.fastq.gz 1266_lib_09653AAB_CAGGCG_1_TRIM.fastq.gz 1250_lib_09631AAB_TGACCA_1_TRIM.fastq.gz 1266_lib_09653AAB_CAGGCG_2_TRIM.fastq.gz 1250_lib_09631AAB_TGACCA_2_TRIM.fastq.gz 1267_lib_09642AAB_CCGTCC_1_TRIM.fastq.gz 1251_lib_09632AAB_ACAGTG_1_TRIM.fastq.gz 1267_lib_09642AAB_CCGTCC_2_TRIM.fastq.gz 1251_lib_09632AAB_ACAGTG_2_TRIM.fastq.gz 1268_lib_09658AAB_CTAGCT_1_TRIM.fastq.gz 1252_lib_09650AAB_ACTGAT_1_TRIM.fastq.gz 1268_lib_09658AAB_CTAGCT_2_TRIM.fastq.gz 1252_lib_09650AAB_ACTGAT_2_TRIM.fastq.gz 1270_lib_09643AAB_GTCCGC_1_TRIM.fastq.gz 1253_lib_09651AAB_ATTCCT_1_TRIM.fastq.gz 1270_lib_09643AAB_GTCCGC_2_TRIM.fastq.gz 1253_lib_09651AAB_ATTCCT_2_TRIM.fastq.gz 1271_lib_09644AAB_GTGAAA_1_TRIM.fastq.gz 1254_lib_09655AAB_CATTTT_1_TRIM.fastq.gz 1271_lib_09644AAB_GTGAAA_2_TRIM.fastq.gz 1254_lib_09655AAB_CATTTT_2_TRIM.fastq.gz 1272_lib_09645AAB_GTTTCG_1_TRIM.fastq.gz 1255_lib_09652AAB_CAACTA_1_TRIM.fastq.gz 1272_lib_09645AAB_GTTTCG_2_TRIM.fastq.gz 1255_lib_09652AAB_CAACTA_2_TRIM.fastq.gz 1273_lib_09646AAB_CGTACG_1_TRIM.fastq.gz 1256_lib_09633AAB_GCCAAT_1_TRIM.fastq.gz 1273_lib_09646AAB_CGTACG_2_TRIM.fastq.gz 1256_lib_09633AAB_GCCAAT_2_TRIM.fastq.gz 1274_lib_09654AAB_CATGGC_1_TRIM.fastq.gz 1257_lib_09634AAB_CAGATC_1_TRIM.fastq.gz 1274_lib_09654AAB_CATGGC_2_TRIM.fastq.gz 1257_lib_09634AAB_CAGATC_2_TRIM.fastq.gz 1275_lib_09647AAB_GAGTGG_1_TRIM.fastq.gz 1258_lib_09635AAB_ACTTGA_1_TRIM.fastq.gz 1275_lib_09647AAB_GAGTGG_2_TRIM.fastq.gz 1258_lib_09635AAB_ACTTGA_2_TRIM.fastq.gz 1278_lib_09659AAB_CTATAC_1_TRIM.fastq.gz 1259_lib_09636AAB_GATCAG_1_TRIM.fastq.gz 1278_lib_09659AAB_CTATAC_2_TRIM.fastq.gz 1259_lib_09636AAB_GATCAG_2_TRIM.fastq.gz 1279_lib_09660AAB_CTCAGA_1_TRIM.fastq.gz 1260_lib_09637AAB_TAGCTT_1_TRIM.fastq.gz 1279_lib_09660AAB_CTCAGA_2_TRIM.fastq.gz So let’s prepare a sbatch job submission file accordingly:\n#!/bin/bash ##This is a good example of a single-process multi-threaded Job Array #SBATCH -p regular # partition name #SBATCH -c 10 # number of cores or threads requested, PER EACH TASK of the array #SBATCH --mem 128G # RAM requested, per each task again #SBATCH --job-name salmon-quant01 # Job name #SBATCH -o job.%A_%a.out # File to which standard out will be written #SBATCH -e job.%A_%a.err # File to which standard err will be written #SBATCH --array=44-79%3 # Define this job as an array. # We use the samples number as range. # The %3 specifies the concurrent tasks. ## Base directory for job input and output data (on /cscratch TUTORIAL=/cscratch/angel/tutorial ## Input, output and index variables INDIR=${TUTORIAL}/dades/cutadapt_results OUTDIR=${TUTORIAL}/dades/salmon_quant_results_cdna_ncrna INDEXFILE=${TUTORIAL}/dades/Rattus_norvegicus.Rnor_6.0.cdna.ncrna_index ## Using the array task ID to extract the full sample name of the file pairs PAIR1=$(ls ${INDIR}/12${SLURM_ARRAY_TASK_ID}*_1_TRIM.fastq.gz) SAMPLE=$(basename ${PAIR1} _1_TRIM.fastq.gz) ## Run Salmon for each pair. ## This is the Salmon command line for each iteration of the array ./salmon_1.10.0.sif salmon quant -i $INDEXFILE -l A \\ -1 $INDIR/${SAMPLE}_1_TRIM.fastq.gz \\ -2 $INDIR/${SAMPLE}_2_TRIM.fastq.gz \\ --gcBias \\ --seqBias \\ --validateMappings \\ -p 10 -o $OUTDIR/${SAMPLE}_quant Lets pay attention to the following snippets:\n#SBATCH -o job.%A_%a.out and #SBATCH -e job.%A_%a.err: In a Job Array, %A is replaced by the Array Job ID and %a is replaced by the each Array Task ID. #SBATCH --array=44-79%3specifies the lower and upper digits of the job array task range, and the ‘%3’ means that 3 of the tasks can run at the same time at most (if there are enough available resources for them) We can submit now our job array:\n[angel@avicenna ~]$ sbatch salmon_quant.run Submitted batch job 107 Let’s check the status of our job:\n[angel@avicenna ~]$ squeue -u angel -o \"%.13i %.6u %.9P %.8j %.8T %.6M %.12l %.5C %.10R\" JOBID USER PARTITION NAME STATE TIME TIME_LIMIT CPUS NODELIST(REASON) 107_[47-79%3] angel regular salmon-q PENDING 0:00 1-00:00:00 10 (JobArrayT 107_44 angel regular salmon-q RUNNING 1:54 1-00:00:00 10 c01 107_45 angel regular salmon-q RUNNING 1:54 1-00:00:00 10 c01 107_46 angel regular salmon-q RUNNING 1:54 1-00:00:00 10 c01 We can see that we have the first 3 tasks running at the smae time, each one using 10 cores. Also note the 107_[47-79%3] job ID whith ‘PENDING’ state, which are the remaining tasks waiting to be executed.\nAnd if we check again a couple of minutes after:\n[angel@avicenna ~]$ squeue -u angel -o \"%.13i %.6u %.9P %.8j %.8T %.6M %.12l %.5C %.10R\" JOBID USER PARTITION NAME STATE TIME TIME_LIMIT CPUS NODELIST(REASON) 107_[50-79%3] angel regular salmon-q PENDING 0:00 1-00:00:00 10 (JobArrayT 107_49 angel regular salmon-q RUNNING 0:00 1-00:00:00 10 c01 107_48 angel regular salmon-q RUNNING 0:03 1-00:00:00 10 c01 107_47 angel regular salmon-q RUNNING 0:05 1-00:00:00 10 c01 Note that now the next 3 tasks are running (47, 48 and 49), since the 3 previous ones finished.\nWe can also check the scontrol information for the job (truncated):\n[angel@avicenna ~]$ scontrol show jobid -d 107 JobId=107 ArrayJobId=107 ArrayTaskId=57-79%3 ArrayTaskThrottle=3 JobName=salmon-quant01 UserId=angel(1000) GroupId=angel(1000) MCS_label=N/A Priority=4294901744 Nice=0 Account=(null) QOS=(null) JobState=PENDING Reason=JobArrayTaskLimit Dependency=(null) Requeue=1 Restarts=0 BatchFlag=1 Reboot=0 ExitCode=0:0 DerivedExitCode=0:0 RunTime=00:00:00 TimeLimit=1-00:00:00 TimeMin=N/A SubmitTime=2023-02-27T01:25:30 EligibleTime=Unknown AccrueTime=2023-02-27T01:25:31 StartTime=Unknown EndTime=Unknown Deadline=N/A SuspendTime=None SecsPreSuspend=0 LastSchedEval=2023-02-27T01:36:38 Scheduler=Main Partition=regular AllocNode:Sid=avicenna:1464201 ReqNodeList=(null) ExcNodeList=(null) NodeList=(null) NumNodes=1 NumCPUs=10 NumTasks=1 CPUs/Task=10 ReqB:S:C:T=0:0:*:* TRES=cpu=10,mem=128G,node=1,billing=10 Socks/Node=* NtasksPerN:B:S:C=0:0:*:* CoreSpec=* MinCPUsNode=10 MinMemoryNode=128G MinTmpDiskNode=0 Features=(null) DelayBoot=00:00:00 OverSubscribe=OK Contiguous=0 Licenses=(null) Network=(null) Command=/home/angel/salmon_quant.run WorkDir=/home/angel StdErr=/home/angel/job.107_4294967294.err StdIn=/dev/null StdOut=/home/angel/job.107_4294967294.out Power= JobId=120 ArrayJobId=107 ArrayTaskId=56 ArrayTaskThrottle=3 JobName=salmon-quant01 UserId=angel(1000) GroupId=angel(1000) MCS_label=N/A Priority=4294901744 Nice=0 Account=(null) QOS=(null) JobState=RUNNING Reason=None Dependency=(null) Requeue=1 Restarts=0 BatchFlag=1 Reboot=0 ExitCode=0:0 DerivedExitCode=0:0 RunTime=00:00:38 TimeLimit=1-00:00:00 TimeMin=N/A SubmitTime=2023-02-27T01:25:30 EligibleTime=2023-02-27T01:36:38 AccrueTime=2023-02-27T01:25:31 StartTime=2023-02-27T01:36:38 EndTime=2023-02-28T01:36:38 Deadline=N/A SuspendTime=None SecsPreSuspend=0 LastSchedEval=2023-02-27T01:36:38 Scheduler=Main Partition=regular AllocNode:Sid=avicenna:1464201 ReqNodeList=(null) ExcNodeList=(null) NodeList=c01 BatchHost=c01 NumNodes=1 NumCPUs=10 NumTasks=1 CPUs/Task=10 ReqB:S:C:T=0:0:*:* TRES=cpu=10,mem=128G,node=1,billing=10 Socks/Node=* NtasksPerN:B:S:C=0:0:*:* CoreSpec=* JOB_GRES=(null) Nodes=c01 CPU_IDs=20-29 Mem=131072 GRES= MinCPUsNode=10 MinMemoryNode=128G MinTmpDiskNode=0 Features=(null) DelayBoot=00:00:00 OverSubscribe=OK Contiguous=0 Licenses=(null) Network=(null) Command=/home/angel/salmon_quant.run WorkDir=/home/angel StdErr=/home/angel/job.107_56.err StdIn=/dev/null StdOut=/home/angel/job.107_56.out Power= JobId=119 ArrayJobId=107 ArrayTaskId=55 ArrayTaskThrottle=3 JobName=salmon-quant01 UserId=angel(1000) GroupId=angel(1000) MCS_label=N/A Priority=4294901744 Nice=0 Account=(null) QOS=(null) JobState=RUNNING Reason=None Dependency=(null) Requeue=1 Restarts=0 BatchFlag=1 Reboot=0 ExitCode=0:0 DerivedExitCode=0:0 RunTime=00:02:50 TimeLimit=1-00:00:00 TimeMin=N/A SubmitTime=2023-02-27T01:25:30 EligibleTime=2023-02-27T01:34:26 AccrueTime=2023-02-27T01:25:31 StartTime=2023-02-27T01:34:26 EndTime=2023-02-28T01:34:26 Deadline=N/A SuspendTime=None SecsPreSuspend=0 LastSchedEval=2023-02-27T01:34:26 Scheduler=Main Partition=regular AllocNode:Sid=avicenna:1464201 ReqNodeList=(null) ExcNodeList=(null) NodeList=c01 BatchHost=c01 NumNodes=1 NumCPUs=10 NumTasks=1 CPUs/Task=10 ReqB:S:C:T=0:0:*:* TRES=cpu=10,mem=128G,node=1,billing=10 Socks/Node=* NtasksPerN:B:S:C=0:0:*:* CoreSpec=* JOB_GRES=(null) Nodes=c01 CPU_IDs=10-19 Mem=131072 GRES= MinCPUsNode=10 MinMemoryNode=128G MinTmpDiskNode=0 Features=(null) DelayBoot=00:00:00 OverSubscribe=OK Contiguous=0 Licenses=(null) Network=(null) Command=/home/angel/salmon_quant.run WorkDir=/home/angel StdErr=/home/angel/job.107_55.err StdIn=/dev/null StdOut=/home/angel/job.107_55.out Power= As you can see, the output shows information about the jobs and about the individual tasks.\nKurtzer, Gregory M.; Sochat, Vanessa; Bauer, Michael W. (2017). “Singularity: Scientific Containers for Mobility of Compute”. PLOS ONE. 12 (5): e0177459 ↩︎\n",
    "description": "",
    "tags": null,
    "title": "Singularity: Quasi-mapping RNA-Seq quantification",
    "uri": "/clustertut/practical-examples/example_singularity/index.html"
  },
  {
    "content": "Although Singularity is the recommended way to run tools on the cluster without the need of requesting administrators a system-wide installation, you can also use Conda-based installations and environments. Please note that, as with any other kind of user-level locally installed software, we can offer limited support.\nInstalling Miniconda We are going to install Miniconda, which is a lightweight Conda distribution. We recommend it, since Miniconda initial installation requires much less disk space than the full Conda distribution, and disk space on the cluster is a limited resource (of course, with Miniconda you can install additional packages whenever you need them).\nFirst, we download the Miniconda installation script:\n[angel@avicenna ~]$ wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh --2023-04-27 20:07:18-- https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh Resolving repo.anaconda.com (repo.anaconda.com)... 104.16.131.3, 104.16.130.3, 2606:4700::6810:8203, ... Connecting to repo.anaconda.com (repo.anaconda.com)|104.16.131.3|:443... connected. HTTP request sent, awaiting response... 200 OK Length: 73134376 (70M) [application/x-sh] Saving to: ‘Miniconda3-latest-Linux-x86_64.sh’ Miniconda3-latest-Linux-x86_64 100%[===================================================\u003e] 69.75M 23.8MB/s in 2.9s 2023-04-27 20:07:21 (23.8 MB/s) - ‘Miniconda3-latest-Linux-x86_64.sh’ saved [73134376/73134376] Now we install it:\n[angel@avicenna ~]$ bash Miniconda3-latest-Linux-x86_64.sh Welcome to Miniconda3 py310_23.3.1-0 After accepting reviewing and accepting the license, confirm the default install location (which is in your home directory) and complete the installation (the remaining default options are fine, but anyway you can change them later).\nNow, exit your session…\n[angel@avicenna ~]$ exit and log in again. You should see your command prompt indicating now that the ‘base’ Conda environment is activated by default:\n(base) [angel@avicenna ~]$ You can prevent this environment to be activated on startup with this command:\nconda config --set auto_activate_base false Exit en log in again to check it.\nCloning the RL-Medical Github repository Next, we get the RL-Medical code from Github. Since in this example we are going to use the sample data that comes with the tool, we are going to place it in the /cscratch storage system:\n[angel@avicenna ~]$ cd /cscratch/angel/tutorial/ [angel@avicenna tutorial]$ git clone https://github.com/gml16/rl-medical.git Cloning into 'rl-medical'... remote: Enumerating objects: 2699, done. remote: Counting objects: 100% (275/275), done. remote: Compressing objects: 100% (20/20), done. remote: Total 2699 (delta 262), reused 257 (delta 255), pack-reused 2424 Receiving objects: 100% (2699/2699), 194.17 MiB | 9.38 MiB/s, done. Resolving deltas: 100% (1693/1693), done. Updating files: 100% (56/56), done. Please remember: You should run your jobs using input data from your /cscratch/\u003cyourusername\u003e directory, and also direct your output files to your /cscratch/\u003cyourusername\u003e directory. Once your computing jobs are not using a set of data from your /cscratch/\u003cyourusername\u003e or producing data into it anymore, this specific data should be moved as soon as possible to your local device and removed from the cluster.\nWith the repository cloned, we get into the newly created rl-medical directory, and use the file ’environment.yml’ to automatically create the Conda environment with all the dependencies needed to run the tool. You can find these instructions on the Github repository of the tool\n[angel@avicenna tutorial]$ cd rl-medical/ [angel@avicenna rl-medical]$ conda env create -f environment.yml Retrieving notices: ...working... done Collecting package metadata (repodata.json): done Solving environment: done Downloading and Extracting Packages ... Wait until all the packages are downloaded and properly installed.\nSubmitting a GPGPU job Choosing the right SLURM partition Remember that in order run our computing jobs, we need to submit them to SLURM (our cluster’s resource and job management system). In this example, we need to use GPU resources to run our job, which means that we need to send the job to the right partition. In SLURM, partitions are simply sets of computing machines that are logically grouped so that SLURM can schedule and execute computing jobs on them according to some particular criteria (like availability of specific hardware resources, maximum length of the jobs, etc). In our cluster there are two partitions, as the sinfo command shows:\n[angel@avicenna ~]$ sinfo PARTITION AVAIL TIMELIMIT NODES STATE NODELIST regular* up 1-00:00:00 1 idle c01 gpgpu up 1-00:00:00 1 idle g01 In our case we need to use the gpgpu partition, since its nodes have GPU hardware resources available for SLURM to use. We can get more specific information about the g01 node, which is a member of the gpgpupartition:\n[angel@avicenna ~]$ scontrol show node g01 NodeName=g01 Arch=x86_64 CoresPerSocket=1 CPUAlloc=0 CPUEfctv=24 CPUTot=24 CPULoad=0.00 AvailableFeatures=(null) ActiveFeatures=(null) Gres=gpu:ampere:2(S:0) NodeAddr=g01 NodeHostName=g01 Version=22.05.2 OS=Linux 4.18.0-372.19.1.el8_6.x86_64 #1 SMP Tue Aug 2 16:19:42 UTC 2022 RealMemory=121856 AllocMem=0 FreeMem=127045 Sockets=24 Boards=1 State=IDLE ThreadsPerCore=1 TmpDisk=0 Weight=1 Owner=N/A MCS_label=N/A Partitions=gpgpu BootTime=2023-02-13T21:25:58 SlurmdStartTime=2023-02-14T00:25:43 LastBusyTime=2023-02-26T02:14:04 CfgTRES=cpu=24,mem=119G,billing=24 AllocTRES= CapWatts=n/a CurrentWatts=0 AveWatts=0 ExtSensorsJoules=n/s ExtSensorsWatts=0 ExtSensorsTemp=n/s Note the Gres=gpu:ampere:2(S:0) line, which means that this particular node has 2 GPUs (in this case, a description of the type, ampere, is included).\nCreating a job submission file Essentially, there are two ways of submitting computing jobs to SLURM, an interactive and a batch mode. The latter is more flexible and less error-prone, specially for less experienced users, so it’s the way we’re going to use for this example.\nFirst, we need to create a job script, which is simply a plain text file containing some SLURM directives and parameters and the actual command of the tool (or tools) to run. You can create this file using any plain text editor. You can use nano or vim for instance, directly from the command line interface while you’re connected to the cluster. Also, you can create it on your local computer and then transfer it to cluster.\nFor example, to create job script with the nano editor named rl-medical_train.run and start editing it:\n[angel@avicenna ~]$ nano rl-medical_train.run Please, refer to the (nano)[https://nano-editor.org/docs.php] documentation to learn how to use the editor if you are not familiar with it (remember that you can use any other plain text editor)\nIn our example, we are going to use the following contents for our job script:\n#!/bin/bash ##This is an example of a simple GPU job #SBATCH -p gpgpu # partition name #SBATCH -c 10 # number of CPU cores or threads requested #SBATCH --mem 30G # RAM requested #SBATCH --gres=gpu:1 # Requesting to use GPU resources, and how many #SBATCH --job-name rlmedical-train01 # Job name #SBATCH -o job.%j.out # File to which standard out will be written (%j is replaced automatically by the SLURM's job ID) #SBATCH -e job.%j.err # File to which standard err will be written (%j is replaced automatically by the SLURM's job ID) ## Base directory for job input and output data (on /cscratch) BASEDIR=/cscratch/angel/tutorial/rl-medical/src ## Input, Output variables IMGFILES=${BASEDIR}data/filenames/image_files.txt LANDMARKFILES=${BASEDIR}data/filenames/landmark_files.txt ## Activate the rl-medical Conda environment conda activate rl-medical ## Run RL-Medical in 'train' mode and exit the conda environment python ${BASEDIR}/DQN.py --task train --memory_size 30000 --init_memory_size 20000 / --files IMGFILES LANDMARKFILES --model_name CommNet --file_type brain / --landmarks 13 14 0 1 2 --multiscale --viz 0 --train_freq 50 --write conda deactivate Now let’s submit our job to SLURM using the job script weve just created:\nNext we can check the state of our job:\nWe can see that our job is running (note the ‘X’ value) on the g01 node. In case the job was queued for execution (due to lack of resource availability at the moment, priority reasons, etc…) the state would be ’’ (‘waiting’), and SLURM will automatically run it when the conditions\n",
    "description": "",
    "tags": null,
    "title": "GPU job: RL-Medical with conda",
    "uri": "/clustertut/practical-examples/example_gpu-conda/index.html"
  },
  {
    "content": "This tutorial covers the basics about running computing jobs on the Statistics and Bioinformatics Unit cluster, using some practical examples.\nYou can navigate using the left navbar or the arrow buttons on the upper left corner. Also, you can use the search box on the upper right corner.\n",
    "description": "",
    "tags": null,
    "title": "UEB Cluster Basic Tutorial",
    "uri": "/clustertut/index.html"
  },
  {
    "content": "",
    "description": "",
    "tags": null,
    "title": "Categories",
    "uri": "/clustertut/categories/index.html"
  },
  {
    "content": "",
    "description": "",
    "tags": null,
    "title": "Tags",
    "uri": "/clustertut/tags/index.html"
  }
]
