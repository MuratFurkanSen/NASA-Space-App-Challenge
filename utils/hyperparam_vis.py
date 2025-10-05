import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np


class XgbMetricsVisualizer:
    def __init__(self, model):
        self.model = model
        self.results = None
        self.evals_result = None

    def visualize_metrics(self, loss_history=None, accuracy_history=None):
        if loss_history is not None:
            plt.figure(figsize=(10, 6))
            plt.plot(loss_history, label='Training Loss')
            plt.xlabel('Iterations')
            plt.ylabel('Loss')
            plt.title('Training Loss over Iterations')
            plt.legend()
            plt.grid(True)
            plt.show()

        if accuracy_history is not None:
            plt.figure(figsize=(10, 6))
            plt.plot(accuracy_history, label='Training Accuracy')
            plt.xlabel('Iterations')
            plt.ylabel('Accuracy')
            plt.title('Training Accuracy over Iterations')
            plt.legend()
            plt.grid(True)
            plt.show()
        
        if accuracy_history and loss_history is None:
            assert "At least 1 metric plot must be provided."
        



