package com.kaiju.store.repository;

import java.util.List;

public class RevenuePieResponse {
    private Summary summary;
    private ChartData chartData;

    public RevenuePieResponse() {}

    public Summary getSummary() { return summary; }
    public void setSummary(Summary summary) { this.summary = summary; }

    public ChartData getChartData() { return chartData; }
    public void setChartData(ChartData chartData) { this.chartData = chartData; }

    public static class Summary {
        private Integer totalProductsSold;

        public Summary() {}
        public Integer getTotalProductsSold() { return totalProductsSold; }
        public void setTotalProductsSold(Integer totalProductsSold) { this.totalProductsSold = totalProductsSold; }
    }

    public static class ChartData {
        private List<String> labels;
        private List<Dataset> datasets;

        public ChartData() {}
        public List<String> getLabels() { return labels; }
        public void setLabels(List<String> labels) { this.labels = labels; }
        public List<Dataset> getDatasets() { return datasets; }
        public void setDatasets(List<Dataset> datasets) { this.datasets = datasets; }
    }

    public static class Dataset {
        private String label;
        private List<Integer> data;
        private List<String> backgroundColor;

        public Dataset() {}
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public List<Integer> getData() { return data; }
        public void setData(List<Integer> data) { this.data = data; }

        public List<String> getBackgroundColor() { return backgroundColor; }
        public void setBackgroundColor(List<String> backgroundColor) { this.backgroundColor = backgroundColor; }
    }
}