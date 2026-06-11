package com.kaiju.store.repository;

import java.math.BigDecimal;
import java.util.List;

public class RevenueBarResponse {
    private Summary summary;
    private ChartData chartData;

    public RevenueBarResponse() {}

    public Summary getSummary() { return summary; }
    public void setSummary(Summary summary) { this.summary = summary; }

    public ChartData getChartData() { return chartData; }
    public void setChartData(ChartData chartData) { this.chartData = chartData; }

    public static class Summary {
        private BigDecimal totalRevenue;
        private String growthRate;

        public Summary() {}
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

        public String getGrowthRate() { return growthRate; }
        public void setGrowthRate(String growthRate) { this.growthRate = growthRate; }
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
        private List<BigDecimal> data;
        private String backgroundColor;

        public Dataset() {}
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public List<BigDecimal> getData() { return data; }
        public void setData(List<BigDecimal> data) { this.data = data; }

        public String getBackgroundColor() { return backgroundColor; }
        public void setBackgroundColor(String backgroundColor) { this.backgroundColor = backgroundColor; }
    }
}