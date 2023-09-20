<template>
    <div>
        <!-- Navbar Start -->
        <nav class="navbar navbar-expand-lg navbar-light sticky-top mainNav" style="padding: 10px;">
            <a class="navbar-brand" href="#" style="color: white;">选择设备</a>
            <!-- Hamburger Menu Icon -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="mobileNav">
                <ul class="navbar-nav ms-auto p-8 align-items-center">
                    <li class="nav-item">
                        <div class="dropdown">
                            <button class="btn dropdown-toggle" type="button" id="logoutDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="color: white;">
                                <i class="fas fa-user"></i> 欢迎您, {{ username }}
                            </button>
                            <div class="dropdown-menu" aria-labelledby="logoutDropdown">
                                <a class="dropdown-item" href="#" @click="confirmLogout()" style="color: black;">登出</a>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
        <!-- Navbar End -->
        <br>
        <h3>請选择设备</h3>
        <div class="text-center mt-4">
          <button class="btn" @click="ButtonClick('设备 A')"> <i class="fas fa-cogs"></i> 设备 A</button>
          <button class="btn" @click="ButtonClick('设备 B')"> <i class="fas fa-cogs"></i> 设备 B</button>
          <button class="btn" @click="ButtonClick('设备 C')"> <i class="fas fa-cogs"></i> 设备 C</button>
        </div>
    </div>
</template>
<script>
export default {
  props: {
    username: String,
  },
  data() {
    return {
      equipment: ''
    };
  },
  methods: {
    confirmLogout() {
      const confirmLogout = window.confirm('确定要登出吗？');
      if (confirmLogout) {
        alert("您已成功登出");
        this.$emit('logout');
      }
    },
    ButtonClick(selectedEquipment){
      this.equipment = selectedEquipment;
      this.$emit('select-item', {equipment: this.equipment});
    }
  },
};
</script>