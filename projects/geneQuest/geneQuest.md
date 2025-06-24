# GeneQuest: Integrated Bioinformatics Analysis Platform
GeneQuest is a full-stack web application built to simplify and unify core bioinformatics tasks such as GenBank searches, sequence alignment via BLAST and MegaBLAST, conservative region identification, and phylogenetic tree construction. Designed for accessibility and scalability, GeneQuest addresses workflow fragmentation and technical barriers that often hinder researchers and students in genomics analysis.

## Project Objective
The aim of GeneQuest is to streamline complex bioinformatics workflows into a unified platform. Traditional approaches rely on disjointed tools like NCBI BLAST, ClustalOmega, and GenBank interfaces, which require separate interactions, file handling, and expertise. GeneQuest simplifies this by offering an integrated, web-based environment that allows users to:

* Search and retrieve gene sequences from NCBI’s GenBank

* Perform sequence alignment using BLAST and MegaBLAST

* Visualize multiple sequence alignments and mutations

* Construct phylogenetic trees to assess evolutionary relationships

* Identify conserved regions among aligned DNA sequences

This application lowers the entry barrier for newcomers to genomics and serves as a productivity booster for researchers.

## Architecture and Technology Stack
GeneQuest follows a modular, two-layer client-server architecture:

**Frontend**: Built with React.js for a component-based, dynamic user interface. Components manage GenBank search, BLAST, tree generation, file upload, and result visualization.

**Backend**: Powered by Flask (Python), the backend handles API routing, integration with NCBI and BioPython, and local caching to reduce redundant requests.

## APIs & Libraries:

NCBI Entrez for GenBank queries

NCBIWWW via BioPython for BLAST/MegaBLAST

MAFFT CLI for multiple sequence alignment

TreeConstruction module from BioPython for phylogenetic trees

Matplotlib for rendering static tree images


## Core Features
### GenBank Sequence Search

Allows users to search NCBI’s GenBank using gene names or accession IDs.

Retrieves metadata and raw sequences in FASTA format.

Enables sequence downloads for offline analysis.

Implements frontend caching using localStorage to improve performance on repeated queries.

### BLAST and MegaBLAST Alignment
Supports two modes:

BLAST: Standard nucleotide alignment using query sequences or accession IDs. Good for medium-sized queries and general similarity checks.

MegaBLAST: Optimized for large and highly similar sequences (e.g., rRNA).

Results include:

Hit IDs, descriptions, E-values, alignment scores

Visual alignment viewer to explore indels, mutations, and conserved regions

Includes FASTA file upload for large-scale alignments.

Caches results in the frontend and manages long-running jobs by polling.

### Phylogenetic Tree Generation
Accepts a list of accession numbers and builds phylogenetic trees using UPGMA via MAFFT and BioPython.

Trees are returned as static images and displayed in the frontend.

Allows both stand-alone tree generation and tree construction from selected BLAST hits.

Built using react-d3-tree for visualization and Matplotlib for rendering static outputs.

### Conservative Region Calculation
Identifies conserved regions across selected sequences from BLAST or manual uploads.

Uses MAFFT to align sequences and a custom ConservedRegionCalc.py tool to analyze similarity.

Returns a visual representation of conserved domains, useful for further downstream analysis such as primer design or functional annotation.

Together, these features offer a well-rounded toolkit for genetic analysis in both academic and research settings.
