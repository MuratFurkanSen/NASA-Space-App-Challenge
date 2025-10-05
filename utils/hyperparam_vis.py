import seaborn as sns
import seaborn.objects as so
import matplotlib.pyplot as plt
import numpy as np

class ModelMetricsVisualizer:
    def __init__(self, model):
        self.model = model
        self.results = None
        self.evals_result = None

    def visualize_metrics(self, 
                         loss_history: list[float] = None, 
                         accuracy_history: list[float] = None) -> None:
        """Visualizes training metrics such as loss and accuracy over iterations."""
        if loss_history is None and accuracy_history is None:
            raise ValueError("At least one of loss_history or accuracy_history must be provided.")

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

    def sns_visualize_metrics(self, 
                             loss_history: list[float] = None, 
                             accuracy_history: list[float] = None) -> None:
        """Visualizes training metrics such as loss and accuracy over iterations using Seaborn Objects API."""
        # Check if at least one metric is provided
        if loss_history is None and accuracy_history is None:
            raise ValueError("At least one of loss_history or accuracy_history must be provided.")

        # Validate input data
        if loss_history is not None and (not loss_history or not all(isinstance(x, (int, float)) for x in loss_history)):
            raise ValueError("loss_history must be a non-empty list of numbers.")
        if accuracy_history is not None and (not accuracy_history or not all(isinstance(x, (int, float)) for x in accuracy_history)):
            raise ValueError("accuracy_history must be a non-empty list of numbers.")

        # If both metrics are provided, create a combined plot with dual y-axes
        if loss_history is not None and accuracy_history is not None:
            # Ensure both histories have the same length
            if len(loss_history) != len(accuracy_history):
                raise ValueError("loss_history and accuracy_history must have the same length.")

            # Create figure with two y-axes
            fig, ax1 = plt.subplots(figsize=(12, 7))
            
            # Plot loss on primary y-axis
            iterations = np.arange(len(loss_history))
            (
                so.Plot(x=iterations, y=loss_history)
                .add(so.Line(color="crimson", marker="o", linewidth=2.5))
                .label(x="Iterations", y="Loss")
                .on(ax1)
                .plot()
            )
            
            # Create second y-axis for accuracy
            ax2 = ax1.twinx()
            (
                so.Plot(x=iterations, y=accuracy_history)
                .add(so.Line(color="navy", marker="o", linewidth=2.5))
                .label(y="Accuracy")
                .on(ax2)
                .plot()
            )
            
            # Add grid and styling
            ax1.grid(True, alpha=0.3)
            ax1.set_title("Training Metrics Over Iterations", fontsize=16)
            
            # Set y-axis limits for accuracy (assuming 0-1 range, with slight padding)
            ax2.set_ylim(0, max(1.05, max(accuracy_history) * 1.05))
            
            # Add legends
            ax1.legend(["Loss"], loc="upper left", frameon=True)
            ax2.legend(["Accuracy"], loc="upper right", frameon=True)
            
            plt.tight_layout()
            plt.show()
            
        else:
            # Handle single metric case
            metric_name = "Loss" if loss_history is not None else "Accuracy"
            metric_data = loss_history if loss_history is not None else accuracy_history
            color = "crimson" if loss_history is not None else "navy"
            
            iterations = np.arange(len(metric_data))
            
            # Create the plot using Seaborn Objects API
            (
                so.Plot(x=iterations, y=metric_data)
                .add(so.Line(color=color, marker="o", linewidth=2.5))
                .label(x="Iterations", y=metric_name, title=f"Training {metric_name} Over Iterations")
                .layout(size=(12, 7))
                .theme({"axes.grid": True, "grid.alpha": 0.3, "axes.labelsize": 14})
                .plot()
            )