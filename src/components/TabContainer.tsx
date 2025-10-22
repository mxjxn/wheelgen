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
    console.log('Tab clicked:', tabId);
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    const currentTab = activeTab();
    console.log('Rendering tab content for:', currentTab);
    const tab = props.tabs.find(t => t.id === currentTab);
    
    if (!tab) {
      console.log('Tab not found:', currentTab);
      return <div>Unknown tab: {currentTab}</div>;
    }
    
    console.log('Found tab:', tab.id, 'content:', tab.content);
    const TabComponent = tab.content;
    return <TabComponent {...tab.props} />;
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
