<template>
  <div class="row g-3">
    <!-- Выбор группы и действия -->
    <div class="col-lg-6">
      <div class="group-section group-section-equal">
        <label class="form-label d-flex align-items-center gap-2 mb-3">
          <Users size="16" />
          <span class="fw-semibold">Выбор группы</span>
        </label>
        <div class="group-selector">
          <select v-model.number="groupManager.selectedId" class="form-select group-select" @change="onGroupSelect">
            <option :value="null">Выберите группу для управления...</option>
            <option v-for="g in groups" :key="g.id" :value="g.id">
              {{ g.name }} ({{ getGroupAnalysesCount(g.id) }} анализов)
            </option>
          </select>
          <div v-if="groupManager.selectedId" class="selected-group-info mt-2">
            <div class="d-flex align-items-center gap-2 text-muted">
              <div class="group-color-indicator" :style="{ backgroundColor: getGroupColor(groupManager.selectedId) }"></div>
              <small>Выбрана группа: <strong>{{ getSelectedGroupName() }}</strong></small>
            </div>
          </div>
        </div>
        <div class="group-actions mt-3">
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-outline-primary btn-sm d-inline-flex align-items-center" 
                    :disabled="!groupManager.selectedId" 
                    @click="selectAllByGroup">
              <List class="me-1" size="14" /> 
              Выделить все
            </button>
            <button class="btn btn-outline-warning btn-sm d-inline-flex align-items-center" 
                    :disabled="!groupManager.selectedId" 
                    @click="ungroupAllInSelected">
              <Unlink class="me-1" size="14" /> 
              Снять группу
            </button>
          </div>
        </div>
        <!-- Добавляем пустое место для выравнивания высоты -->
        <div class="group-spacer"></div>
      </div>
    </div>
    
    <!-- Создание и редактирование группы -->
    <div class="col-lg-6">
      <div class="group-section group-section-equal">
        <label class="form-label d-flex align-items-center gap-2 mb-3">
          <Plus size="16" />
          <span class="fw-semibold">Создание и редактирование</span>
        </label>
        <div class="group-creator">
          <div class="input-group">
            <span class="input-group-text">
              <Hash size="16" />
            </span>
            <input class="form-control" 
                   v-model.trim="groupManager.name" 
                   placeholder="Введите название группы" 
                   @keyup.enter="groupManager.selectedId ? renameSelectedGroup() : createGroup()" />
          </div>
          <div class="group-buttons mt-3">
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-success btn-sm d-inline-flex align-items-center" 
                      :disabled="!groupManager.name" 
                      @click="createGroup">
                <Plus class="me-1" size="14" /> 
                Создать
              </button>
              <button class="btn btn-secondary btn-sm d-inline-flex align-items-center" 
                      :disabled="!groupManager.selectedId || !groupManager.name" 
                      @click="renameSelectedGroup">
                <Edit3 class="me-1" size="14" /> 
                Переименовать
              </button>
              <button class="btn btn-outline-danger btn-sm d-inline-flex align-items-center" 
                      :disabled="!groupManager.selectedId" 
                      @click="requestDeleteGroup">
                <Trash2 class="me-1" size="14" /> 
                Удалить
              </button>
            </div>
          </div>
        </div>
        <!-- Добавляем пустое место для выравнивания высоты -->
        <div class="group-spacer"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { Users, Plus, Hash, List, Unlink, Edit3, Trash2 } from 'lucide-vue-next'

export default {
  name: 'GroupManagementBlock',
  components: {
    Users,
    Plus,
    Hash,
    List,
    Unlink,
    Edit3,
    Trash2
  },
  props: {
    groups: {
      type: Array,
      default: () => []
    },
    groupManager: {
      type: Object,
      required: true
    }
  },
  methods: {
    onGroupSelect() {
      this.$emit('group-select', this.groupManager.selectedId)
    },
    selectAllByGroup() {
      this.$emit('select-all-by-group', this.groupManager.selectedId)
    },
    ungroupAllInSelected() {
      this.$emit('ungroup-all-in-selected', this.groupManager.selectedId)
    },
    createGroup() {
      this.$emit('create-group', this.groupManager.name)
    },
    renameSelectedGroup() {
      this.$emit('rename-selected-group', {
        id: this.groupManager.selectedId,
        name: this.groupManager.name
      })
    },
    requestDeleteGroup() {
      this.$emit('request-delete-group', this.groupManager.selectedId)
    },
    getGroupAnalysesCount(groupId) {
      return this.$parent.getGroupAnalysesCount ? this.$parent.getGroupAnalysesCount(groupId) : 0
    },
    getGroupColor(groupId) {
      return this.$parent.getGroupColor ? this.$parent.getGroupColor(groupId) : '#007bff'
    },
    getSelectedGroupName() {
      const group = this.groups.find(g => g.id === this.groupManager.selectedId)
      return group ? group.name : ''
    }
  }
}
</script>

<style scoped>
.group-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.group-section-equal {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.group-spacer {
  flex-grow: 1;
}

.group-selector .form-select {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
}

.group-selector .form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.selected-group-info {
  padding: 0.5rem;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(0, 123, 255, 0.2);
}

.group-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.group-actions .btn {
  border-radius: 6px;
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.group-creator .input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
}

.group-creator .form-control {
  border-left: 0;
  border-right: 0;
}

.group-creator .form-control:focus {
  border-color: #007bff;
  box-shadow: none;
}

.group-buttons .btn {
  border-radius: 6px;
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

@media (max-width: 768px) {
  .group-section {
    padding: 1rem;
  }
  
  .group-actions .d-flex {
    flex-direction: column;
  }
  
  .group-actions .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .group-buttons .d-flex {
    flex-direction: column;
  }
  
  .group-buttons .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
