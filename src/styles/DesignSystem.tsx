import styled from 'styled-components';

export const Theme = {
  colors: {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    primary: '#0071E3',
    secondary: '#86868B',
    border: '#D2D2D7',
    danger: '#FF3B30',
    success: '#34C759',
  },
  radius: {
    small: '8px',
    medium: '12px',
    large: '20px',
  },
  shadows: {
    soft: '0 4px 12px rgba(0, 0, 0, 0.05)',
    medium: '0 8px 24px rgba(0, 0, 0, 0.1)',
  }
};

export const MainLayout = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${Theme.colors.background};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

export const Sidebar = styled.aside`
  width: 280px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid ${Theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

export const CanvasArea = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const UIButton = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? Theme.colors.primary : 'transparent'};
  color: ${props => props.primary ? '#fff' : Theme.colors.primary};
  border: ${props => props.primary ? 'none' : `1px solid ${Theme.colors.primary}`};
  padding: 10px 20px;
  border-radius: ${Theme.radius.medium};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
