/**
 * ANIMATED BAR CHART
 * D3.js powered bar chart with smooth animations and interactions
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface BarData {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface AnimatedBarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical';
  showValues?: boolean;
  showPercentages?: boolean;
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

export const AnimatedBarChart: React.FC<AnimatedBarChartProps> = ({
  data,
  width = 400,
  height = 300,
  orientation = 'vertical',
  showValues = true,
  showPercentages = false,
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

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const maxValue = d3.max(data, (d) => d.value) || 0;
    
    const xScale = orientation === 'vertical'
      ? d3.scaleBand().domain(data.map(d => d.label)).range([0, innerWidth]).padding(0.1)
      : d3.scaleLinear().domain([0, maxValue]).range([0, innerWidth]);
    
    const yScale = orientation === 'vertical'
      ? d3.scaleLinear().domain([0, maxValue]).range([innerHeight, 0])
      : d3.scaleBand().domain(data.map(d => d.label)).range([0, innerHeight]).padding(0.1);

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => orientation === 'vertical' ? xScale(d.label) || 0 : 0)
      .attr('y', (d) => orientation === 'vertical' ? yScale(d.value) : yScale(d.label) || 0)
      .attr('width', (d) => orientation === 'vertical' ? xScale.bandwidth() : 0)
      .attr('height', (d) => orientation === 'vertical' ? 0 : yScale.bandwidth())
      .attr('fill', (d) => d.color || '#4a90e2')
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', 'pointer');

    // Animate bars
    if (animated) {
      bars
        .transition()
        .delay((d, i) => i * 100)
        .duration(800)
        .attr('width', (d) => orientation === 'vertical' ? xScale.bandwidth() : xScale(d.value))
        .attr('height', (d) => orientation === 'vertical' ? innerHeight - yScale(d.value) : yScale.bandwidth());
    } else {
      bars
        .attr('width', (d) => orientation === 'vertical' ? xScale.bandwidth() : xScale(d.value))
        .attr('height', (d) => orientation === 'vertical' ? innerHeight - yScale(d.value) : yScale.bandwidth());
    }

    // Add value labels
    if (showValues) {
      const labels = g
        .selectAll('.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (d) => {
          if (orientation === 'vertical') {
            return (xScale(d.label) || 0) + xScale.bandwidth() / 2;
          } else {
            return xScale(d.value) - 5;
          }
        })
        .attr('y', (d) => {
          if (orientation === 'vertical') {
            return yScale(d.value) - 5;
          } else {
            return (yScale(d.label) || 0) + yScale.bandwidth() / 2;
          }
        })
        .attr('text-anchor', orientation === 'vertical' ? 'middle' : 'end')
        .attr('dominant-baseline', orientation === 'vertical' ? 'baseline' : 'middle')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#666')
        .text((d) => {
          if (showPercentages && d.percentage) {
            return `${d.percentage.toFixed(1)}%`;
          }
          return d.value.toLocaleString();
        })
        .style('opacity', animated ? 0 : 1);

      if (animated) {
        labels
          .transition()
          .delay((d, i) => i * 100 + 400)
          .duration(400)
          .style('opacity', 1);
      }
    }

    // Add tooltip interactions
    bars
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);
        
        setTooltip({
          visible: true,
          x: event.pageX - 10,
          y: event.pageY - 10,
          content: `${d.label}: ${d.value.toLocaleString()}${showPercentages && d.percentage ? ` (${d.percentage.toFixed(1)}%)` : ''}`,
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

    // Add axes
    if (orientation === 'vertical') {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .style('color', '#666')
        .style('font-size', '12px');

      g.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d3.format('.0s')))
        .style('color', '#666')
        .style('font-size', '12px');
    } else {
      g.append('g')
        .call(d3.axisLeft(yScale))
        .style('color', '#666')
        .style('font-size', '12px');

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format('.0s')))
        .style('color', '#666')
        .style('font-size', '12px');
    }
  }, [data, width, height, orientation, showValues, showPercentages, animated]);

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
