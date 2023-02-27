var relearn_search_index = [
  {
    "content": "Lorem Ipsum.\n",
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
    "content": "First Content Discover what this Hugo theme is all about and the core concepts behind it, FIRST CONTACTT\n",
    "description": "",
    "tags": null,
    "title": "First Content",
    "uri": "/clustertut/basics/first-content/index.html"
  },
  {
    "content": "Pre-installed software: RNA-Seq QC\n",
    "description": "",
    "tags": null,
    "title": "Pre-installed software: RNA-Seq QC",
    "uri": "/clustertut/practical-examples/example_pre-installed/index.html"
  },
  {
    "content": "Lorem Ipsum.\n",
    "description": "",
    "tags": null,
    "title": "Seconds",
    "uri": "/clustertut/seconds/index.html"
  },
  {
    "content": "Second content Discover what this Hugo theme is all about and the core concepts behind it, with this SECOND CONTENTTT\n",
    "description": "",
    "tags": null,
    "title": "Second Content",
    "uri": "/clustertut/basics/second-content/index.html"
  },
  {
    "content": "The use of Singularity containers is supported in the cluster. In contrast to other container technologies, Singularity is a good fit to HPC environments, since:\nSingularity containers don’t need administrative privileges to be executed. Performance levels are very close to regular binaries. Compatibility with Docker images, which enables the use of a huge number of readily available existing containerized tools. Container building tools similar to Docker. Users can build custom containers using already acquired general principles. Singularity containers mount several common common storage locations, like $HOME. Also, in our cluster they are configured to mount /cscratch automatically. One of the main aims and uses of Singularity is to bring containers and reproducibility to scientific computing and high-performance computing (HPC)1\nFor these reasons, Singularity is great for running tools on the cluster without having to request the administrators to install them system-wide. Users can simply pull existing images from public repositories, or build their own. This simplifies specially the use of tools with complex dependencies, without having to depend on system-wide installations of specific components and versions. Once ready, the containers can be run as SLURM jobs, in a very similar fashion to running regular binaries.\nIn this example, we will use the latest version of Salmon from a Singularity container to perform a quasi-mapping quantification of the reads that we pre-processed in the previous example.\nGetting a Singularity image First let’s load the Singularity module:\n[angel@avicenna ~]$ module load singularity Next, we need a container image for Salmon. The developers maintain an official Docker image, hosted at Docker Hub. Let’s use Singularity to fetch it and convert it to .sif format (the native Singularity format) in just one simple command:\n[angel@avicenna ~]$ singularity pull docker://combinelab/salmon:1.10.0 This will download the original image, convert it to .sif format and save it to salmon_1.10.0.sif in the current directory:\n-rwxrwxr-x 1 angel angel 42672128 Feb 26 22:00 salmon_1.10.0.sif Info The Biocontainers project provides free and readily available containers for thousands of bioinformatics tools. You can get their Docker images directly from their Quay.io space. For instance:\n[angel@avicenna ~]$ singularity pull docker://quay.io/biocontainers/bowtie2:2.5.1--py310h8d7afc0_0 Also, the Galaxy Project (both projects are related) maintains a repository containing all the Biocontainers images already converted to the Singularity native format. For instance:\n[angel@avicenna ~]$ singularity pull https://depot.galaxyproject.org/singularity/bowtie2:2.5.1--py310h8d7afc0_0 Quasi-mapping quantification Once our index is ready, we can proceed to run Salmon in mapping-based mode to obtain a quasi-mapping quantification.\nSince our input reads are paired-end ones, we have a pair of files per each sample. We are going to use the SLURM’s Job Array feature to automatically submit for execution all the required Salmon tasks (taking advantage of the serialized sample prefix of the files’ names).\nLet’s remember this naming pattern of the input files:\n[angel@avicenna ~]$ ls /cscratch/angel/tutorial/dades/cutadapt_results/ 1244_lib_09628AAB_ATCACG_1_TRIM.fastq.gz 1260_lib_09637AAB_TAGCTT_2_TRIM.fastq.gz 1244_lib_09628AAB_ATCACG_2_TRIM.fastq.gz 1261_lib_09638AAB_GGCTAC_1_TRIM.fastq.gz 1245_lib_09641AAB_ATGTCA_1_TRIM.fastq.gz 1261_lib_09638AAB_GGCTAC_2_TRIM.fastq.gz 1245_lib_09641AAB_ATGTCA_2_TRIM.fastq.gz 1262_lib_09656AAB_CCAACA_1_TRIM.fastq.gz 1246_lib_09629AAB_CGATGT_1_TRIM.fastq.gz 1262_lib_09656AAB_CCAACA_2_TRIM.fastq.gz 1246_lib_09629AAB_CGATGT_2_TRIM.fastq.gz 1263_lib_09639AAB_CTTGTA_1_TRIM.fastq.gz 1247_lib_09648AAB_AGTTCC_1_TRIM.fastq.gz 1263_lib_09639AAB_CTTGTA_2_TRIM.fastq.gz 1247_lib_09648AAB_AGTTCC_2_TRIM.fastq.gz 1264_lib_09657AAB_CGGAAT_1_TRIM.fastq.gz 1248_lib_09649AAB_GGTAGC_1_TRIM.fastq.gz 1264_lib_09657AAB_CGGAAT_2_TRIM.fastq.gz 1248_lib_09649AAB_GGTAGC_2_TRIM.fastq.gz 1265_lib_09640AAB_AGTCAA_1_TRIM.fastq.gz 1249_lib_09630AAB_TTAGGC_1_TRIM.fastq.gz 1265_lib_09640AAB_AGTCAA_2_TRIM.fastq.gz 1249_lib_09630AAB_TTAGGC_2_TRIM.fastq.gz 1266_lib_09653AAB_CAGGCG_1_TRIM.fastq.gz 1250_lib_09631AAB_TGACCA_1_TRIM.fastq.gz 1266_lib_09653AAB_CAGGCG_2_TRIM.fastq.gz 1250_lib_09631AAB_TGACCA_2_TRIM.fastq.gz 1267_lib_09642AAB_CCGTCC_1_TRIM.fastq.gz 1251_lib_09632AAB_ACAGTG_1_TRIM.fastq.gz 1267_lib_09642AAB_CCGTCC_2_TRIM.fastq.gz 1251_lib_09632AAB_ACAGTG_2_TRIM.fastq.gz 1268_lib_09658AAB_CTAGCT_1_TRIM.fastq.gz 1252_lib_09650AAB_ACTGAT_1_TRIM.fastq.gz 1268_lib_09658AAB_CTAGCT_2_TRIM.fastq.gz 1252_lib_09650AAB_ACTGAT_2_TRIM.fastq.gz 1270_lib_09643AAB_GTCCGC_1_TRIM.fastq.gz 1253_lib_09651AAB_ATTCCT_1_TRIM.fastq.gz 1270_lib_09643AAB_GTCCGC_2_TRIM.fastq.gz 1253_lib_09651AAB_ATTCCT_2_TRIM.fastq.gz 1271_lib_09644AAB_GTGAAA_1_TRIM.fastq.gz 1254_lib_09655AAB_CATTTT_1_TRIM.fastq.gz 1271_lib_09644AAB_GTGAAA_2_TRIM.fastq.gz 1254_lib_09655AAB_CATTTT_2_TRIM.fastq.gz 1272_lib_09645AAB_GTTTCG_1_TRIM.fastq.gz 1255_lib_09652AAB_CAACTA_1_TRIM.fastq.gz 1272_lib_09645AAB_GTTTCG_2_TRIM.fastq.gz 1255_lib_09652AAB_CAACTA_2_TRIM.fastq.gz 1273_lib_09646AAB_CGTACG_1_TRIM.fastq.gz 1256_lib_09633AAB_GCCAAT_1_TRIM.fastq.gz 1273_lib_09646AAB_CGTACG_2_TRIM.fastq.gz 1256_lib_09633AAB_GCCAAT_2_TRIM.fastq.gz 1274_lib_09654AAB_CATGGC_1_TRIM.fastq.gz 1257_lib_09634AAB_CAGATC_1_TRIM.fastq.gz 1274_lib_09654AAB_CATGGC_2_TRIM.fastq.gz 1257_lib_09634AAB_CAGATC_2_TRIM.fastq.gz 1275_lib_09647AAB_GAGTGG_1_TRIM.fastq.gz 1258_lib_09635AAB_ACTTGA_1_TRIM.fastq.gz 1275_lib_09647AAB_GAGTGG_2_TRIM.fastq.gz 1258_lib_09635AAB_ACTTGA_2_TRIM.fastq.gz 1278_lib_09659AAB_CTATAC_1_TRIM.fastq.gz 1259_lib_09636AAB_GATCAG_1_TRIM.fastq.gz 1278_lib_09659AAB_CTATAC_2_TRIM.fastq.gz 1259_lib_09636AAB_GATCAG_2_TRIM.fastq.gz 1279_lib_09660AAB_CTCAGA_1_TRIM.fastq.gz 1260_lib_09637AAB_TAGCTT_1_TRIM.fastq.gz 1279_lib_09660AAB_CTCAGA_2_TRIM.fastq.gz So let’s prepare a sbatch job submission file accordingly:\n#!/bin/bash ##This is a good example of a single-process multi-threaded Job Array #SBATCH -p regular # partition name #SBATCH -c 10 # number of cores or threads requested, PER EACH TASK of the array #SBATCH --mem 128G # RAM requested, per each task again #SBATCH --job-name salmon-quant01 # Job name #SBATCH -o job.%A_%a.out # File to which standard out will be written #SBATCH -e job.%A_%a.err # File to which standard err will be written #SBATCH --array=44-79%3 # Define this job as an array. # We use the samples number as range. # The %3 specifies the concurrent tasks. ## Base directory for job input and output data (on /cscratch TUTORIAL=/cscratch/angel/tutorial ## Input, output and index variables INDIR=${TUTORIAL}/dades/cutadapt_results OUTDIR=${TUTORIAL}/dades/salmon_quant_results_cdna_ncrna INDEXFILE=${TUTORIAL}/dades/Rattus_norvegicus.Rnor_6.0.cdna.ncrna_index ## Using the array task ID to extract the full sample name of the file pairs PAIR1=$(ls ${INDIR}/12${SLURM_ARRAY_TASK_ID}*_1_TRIM.fastq.gz) SAMPLE=$(basename ${PAIR1} _1_TRIM.fastq.gz) ## Run Salmon for each pair. ## This is the Salmon command line for each iteration of the array ./salmon_1.10.0.sif salmon quant -i $INDEXFILE -l A \\ -1 $INDIR/${SAMPLE}_1_TRIM.fastq.gz \\ -2 $INDIR/${SAMPLE}_2_TRIM.fastq.gz \\ --gcBias \\ --seqBias \\ --validateMappings \\ -p 10 -o $OUTDIR/${SAMPLE}_quant Lets pay attention to the following snippets:\n#SBATCH -o job.%A_%a.out and #SBATCH -e job.%A_%a.err: In a Job Array, %A is replaced by the job ID and %a is replaced by the task ID. #SBATCH --array=44-79%3specifies the lower and upper digits of the job array task range, and the %3 means that 3 of the tasks can run at the same time at most (if there are enough available resources for them) We can submit now our job array:\n[angel@avicenna ~]$ sbatch salmon_quant.run Submitted batch job 107 Let’s check the status of our job:\n[angel@avicenna ~]$ squeue -u angel -o \"%.13i %.6u %.9P %.8j %.8T %.6M %.12l %.5C %.10R\" JOBID USER PARTITION NAME STATE TIME TIME_LIMIT CPUS NODELIST(REASON) 107_[47-79%3] angel regular salmon-q PENDING 0:00 1-00:00:00 10 (JobArrayT 107_44 angel regular salmon-q RUNNING 1:54 1-00:00:00 10 c01 107_45 angel regular salmon-q RUNNING 1:54 1-00:00:00 10 c01 107_46 angel regular salmon-q RUNNING 1:54 1-00:00:00 10 c01 We can see that we have the first 3 tasks running at the smae time, each one using 10 cores. Also note the 107_[47-79%3] job ID whith ‘PENDING’ state, which are the remaining tasks waiting to be executed.\nAnd if we check again a couple of minutes after:\n[angel@avicenna ~]$ squeue -u angel -o \"%.13i %.6u %.9P %.8j %.8T %.6M %.12l %.5C %.10R\" JOBID USER PARTITION NAME STATE TIME TIME_LIMIT CPUS NODELIST(REASON) 107_[50-79%3] angel regular salmon-q PENDING 0:00 1-00:00:00 10 (JobArrayT 107_49 angel regular salmon-q RUNNING 0:00 1-00:00:00 10 c01 107_48 angel regular salmon-q RUNNING 0:03 1-00:00:00 10 c01 107_47 angel regular salmon-q RUNNING 0:05 1-00:00:00 10 c01 Note that now the tasks running are the next 3 ones (47, 48 and 49), since the 3 previous ones finished.\nKurtzer, Gregory M.; Sochat, Vanessa; Bauer, Michael W. (2017). “Singularity: Scientific Containers for Mobility of Compute”. PLOS ONE. 12 (5): e0177459 ↩︎\n",
    "description": "",
    "tags": null,
    "title": "Singularity: Quasi-mapping RNA-Seq quantification",
    "uri": "/clustertut/practical-examples/example_singularity/index.html"
  },
  {
    "content": "GPU job: RL-Medical with conda\n",
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
