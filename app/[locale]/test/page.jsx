'use client';
import WindowsTab from '../../../components/ui/WindowsTab';
import WindowsManager from '../../../components/ui/WindowsManager';

export default function TestPage() {
  return (
    <WindowsManager>
      <WindowsTab
        id="tab1"
        titre="Tab 1"
        contenu="Contenu de la première fenêtre."
        couleur="bg-blue-300"
      />
      <WindowsTab
        id="tab2"
        titre="Tab 2"
        contenu="Contenu de la deuxième fenêtre."
        couleur="bg-green-300"
      />
    </WindowsManager>
  );
}
