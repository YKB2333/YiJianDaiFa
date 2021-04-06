<template>
    <button open-type="contact" class="plr0 bg-opacity inline-block w-full" style="overflow:unset;">
      <slot></slot>
    </button>
</template>

<script>

export default {
  name: 'CustomerService'
};
</script>

<style lang="scss" scoped>
.bg-opacity{
  background-color: transparent;
  border: none;
  padding-right:0 !important;
  line-height: inherit !important;
}
.bg-opacity::after {
  content: '';
  border: none;
}
.inline-block{
  display: inline-block !important;
}
</style>
