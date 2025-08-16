import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, LetterTemplate } from '../lib/supabase';
import TemplateEditor from '../components/TemplateEditor';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

const Templates: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [editorContent, setEditorContent] = useState('');

  // Fetch templates
  const fetchTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('letter_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create new template
  const handleCreateTemplate = async (content: string) => {
    if (!user || !newTemplateName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('letter_templates')
        .insert({
          user_id: user.id,
          name: newTemplateName,
          html_content: content,
          placeholders: ['recipient_name', 'amount', 'state', 'date', 'company_name']
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates([data, ...templates]);
      setShowEditor(false);
      setNewTemplateName('');
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  // Update template
  const handleUpdateTemplate = async (content: string) => {
    if (!editingTemplate) return;

    try {
      const { error } = await supabase
        .from('letter_templates')
        .update({
          html_content: content
        })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, html_content: content }
          : t
      ));
      setShowEditor(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('letter_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Edit template
  const handleEditTemplate = (template: LetterTemplate) => {
    setEditingTemplate(template);
    setEditorContent(template.html_content || '');
    setShowEditor(true);
  };

  // Create new template
  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setEditorContent('');
    setShowEditor(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Letter Templates</h1>
        <button
          onClick={handleNewTemplate}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Template Editor */}
      {showEditor && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </h2>
            <button
              onClick={() => setShowEditor(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {!editingTemplate && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <TemplateEditor
            initialContent={editingTemplate?.html_content || ''}
            onContentChange={(content) => setEditorContent(content)}
          />

          <div className="mt-4 flex items-center justify-end space-x-3">
            <button
              onClick={() => {
                setShowEditor(false);
                setEditingTemplate(null);
                setNewTemplateName('');
                setEditorContent('');
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (editingTemplate) {
                  handleUpdateTemplate(editorContent);
                } else {
                  handleCreateTemplate(editorContent);
                }
              }}
              disabled={!editingTemplate && !newTemplateName.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Edit template"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                  title="Delete template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <div 
                className="line-clamp-3"
                dangerouslySetInnerHTML={{ 
                  __html: template.html_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {template.is_default ? 'Default Template' : 'Custom Template'}
              </span>
              <span>
                {new Date(template.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && !showEditor && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first letter template to get started with escheatment mail service.
          </p>
          <button
            onClick={handleNewTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Template
          </button>
        </div>
      )}
    </div>
  );
};

export default Templates;
