import { Component, createSignal, For, Show, createMemo } from 'solid-js';
import { RingsControls } from './RingsControls';
import { ActionsControls } from './ActionsControls';
import { ColorManagementPanel } from './ColorManagementPanel';

export interface Tab {
  id: string;
  label: string;
  icon: string;
  content: Component<any>;
  props?: any;
}

interface TabContainerProps {
  tabs: Tab[];
  defaultTab?: string;
}

export const TabContainer: Component<TabContainerProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal(props.defaultTab || props.tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    const currentTab = activeTab();
    
    switch (currentTab) {
      case 'rings':
        return <RingsControls {...props.tabs[0].props} />;
      case 'actions':
        return <ActionsControls {...props.tabs[1].props} />;
      case 'colors':
        return <ColorManagementPanel {...props.tabs[2].props} />;
      default:
        return <div>Unknown tab: {currentTab}</div>;
    }
  };

  return (
    <div class="tab-container">
      {/* Tab Navigation - Fixed below header */}
      <div class="tab-navigation">
        <For each={props.tabs}>
          {(tab) => (
            <button
              class={`tab-button ${activeTab() === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
            >
              <span class="tab-icon">{tab.icon}</span>
              <span class="tab-label">{tab.label}</span>
            </button>
          )}
        </For>
      </div>

      {/* Tab Content - Scrollable */}
      <div class="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};
