/**
 * DONUT CHART
 * D3.js powered donut chart with smooth animations and interactions
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface DonutData {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface DonutChartProps {
  data: DonutData[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  animated?: boolean;
  title?: string;
  subtitle?: string;
}

const ChartContainer = styled(motion.div)`
  background: ${(props) => props.theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${(props) => props.theme.neumorphic.shadowLight};
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: ${(props) => props.theme.neumorphic.shadowDark};
  }
`;

const ChartTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 8px 0;
`;

const ChartSubtitle = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: ${(props) => props.theme.colors.text}80;
  margin: 0 0 24px 0;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${(props) => props.theme.colors.text};
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;

const Tooltip = styled.div<{ visible: boolean; x: number; y: number }>`
  position: absolute;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transform: translate(${(props) => props.x}px, ${(props) => props.y}px);
  transition: opacity 0.2s ease;
`;

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = 300,
  height = 300,
  innerRadius = 60,
  outerRadius = 120,
  showLabels = true,
  showLegend = true,
  animated = true,
  title,
  subtitle,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
  });

  // Default colors
  const defaultColors = [
    '#4a90e2',
    '#7b68ee',
    '#20b2aa',
    '#ff6b6b',
    '#feca57',
    '#48dbfb',
    '#ff9ff3',
    '#54a0ff',
  ];

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions
    const centerX = width / 2;
    const centerY = height / 2;

    // Create pie generator
    const pie = d3
      .pie<DonutData>()
      .value((d) => d.value)
      .sort(null);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<DonutData>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    // Create label arc generator
    const labelArc = d3
      .arc<d3.PieArcDatum<DonutData>>()
      .innerRadius(outerRadius + 20)
      .outerRadius(outerRadius + 20);

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Generate pie data
    const pieData = pie(data);

    // Add arcs
    const arcs = g
      .selectAll('.arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Add paths
    const paths = arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => d.data.color || defaultColors[i % defaultColors.length])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', animated ? 0 : 1);

    // Animate paths
    if (animated) {
      paths
        .transition()
        .delay((d, i) => i * 150)
        .duration(800)
        .attrTween('d', function (d) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function (t) {
            return arc(interpolate(t)) || '';
          };
        })
        .style('opacity', 1);
    }

    // Add labels
    if (showLabels) {
      const labels = arcs
        .append('text')
        .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#666')
        .text((d) => {
          const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
          return percentage > 5 ? `${percentage.toFixed(1)}%` : '';
        })
        .style('opacity', animated ? 0 : 1);

      if (animated) {
        labels
          .transition()
          .delay((d, i) => i * 150 + 400)
          .duration(400)
          .style('opacity', 1);
      }
    }

    // Add tooltip interactions
    paths
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);
        
        const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
        setTooltip({
          visible: true,
          x: event.pageX - 10,
          y: event.pageY - 10,
          content: `${d.data.label}: ${d.data.value.toLocaleString()} (${percentage.toFixed(1)}%)`,
        });
      })
      .on('mousemove', function (event) {
        setTooltip((prev) => ({
          ...prev,
          x: event.pageX - 10,
          y: event.pageY - 10,
        }));
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
        
        setTooltip((prev) => ({ ...prev, visible: false }));
      });
  }, [data, width, height, innerRadius, outerRadius, showLabels, animated]);

  return (
    <ChartContainer
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {title && <ChartTitle>{title}</ChartTitle>}
      {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
      
      {showLegend && (
        <Legend>
          {data.map((item, index) => (
            <LegendItem key={item.label}>
              <LegendColor color={item.color || defaultColors[index % defaultColors.length]} />
              <span>{item.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
      
      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
      >
        {tooltip.content}
      </Tooltip>
    </ChartContainer>
  );
};
