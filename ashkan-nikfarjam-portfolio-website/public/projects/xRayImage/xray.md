# Medical X-Ray Image Classification (CNN-RNN + NAS)

This project presents an AI-powered pipeline for classifying bone X-ray images by region and fracture status. Designed to support diagnostic workflows, it uses deep learning techniques—including CNN-RNN architecture and Neural Architecture Search (NAS) to automate hyperparameter tuning and optimize network architecture.

## Objective
The goal was to develop a robust model capable of:

Identifying the anatomical region (e.g., hand, leg, spine)

Classifying each image as fractured or not fractured

This helps address the challenge of rapid, reliable diagnosis in medical imaging, particularly in emergency or high-volume clinical settings.

## Data Acquisition & Preprocessing
X-ray datasets were sourced from Kaggle and Robofile, covering various skeletal regions such as:

Hands and wrists

Shoulders and humerus

Legs, feet, and hips

Spine and neck

### Key preprocessing strategies included:

Data Deduplication and Label Correction

Several datasets included visually similar but ambiguously labeled images (e.g., wrist vs. hand). Two separate CNN-RNN base models were trained to resolve and relabel such ambiguities before merging datasets.

Truncated Image Repair

Custom Python scripts detected and repaired images with missing pixel rows by zero-padding damaged areas. This ensured data integrity for training.

Balanced Splitting & Augmentation

Datasets were uniformly split into 60% training, 20% validation, and 20% testing. Data augmentation methods—including Fourier and wavelet transformations—were applied to enhance feature diversity.

# Base Model Development
Two binary CNN-RNN models were developed to:

Classify ambiguous hand, forearm, and wrist images

Merge similar classes like leg and foot

Each model used wavelet-enhanced Fourier transforms to boost spatial signal clarity. After evaluation, confidently classified images were merged into a larger, clean dataset.

## Main Model Architecture
Inspired by the work of Qiwei Yin et al., the final model combined:

CNN Layers for extracting visual features like edges and shapes

Bidirectional LSTM RNNs to retain contextual relationships across spatial dimensions

Wavelet transform was used in preprocessing to capture both frequency and time-domain features—ideal for identifying irregularities in bone structures.

## Neural Architecture Search (NAS)
NAS was implemented to automatically optimize:

Layer depth, filter sizes, and dropout rates

Placement of pooling layers

LSTM cell configuration and fully connected layers

Using sparse_categorical_crossentropy as the loss function, Keras Tuner searched the architecture space based on validation score and returned a model with 88.5% accuracy.

# Model Comparisons
Four models were benchmarked:

* CNN-RNN + NAS (Main) -> 88.5% accuracy ->	Best-performing model with balanced loss 
* CNN + NAS (no RNN) -> 87% -> Slightly lower accuracy, higher loss 
* Traditional CNN (baseline) -> 51.7% ->	Underperformed due to lack of temporal data 
* Random Forest + SearchCV -> 77% ->	Efficient on smaller subsets only 