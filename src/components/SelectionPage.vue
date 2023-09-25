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
        <h3>請选择设备</h3><br>
        <div class="container">
          <div class="row">
            <div v-for="(deviceGroup, index) in deviceGroups" :key="index" class="col-md-6 device-group-space">
              <div class="text-center mt-4">
                <ul class="list-unstyled tree">
                  <li>
                    <!-- Apply circular container to the button element -->
                    <button class="circular-btn" @click="ButtonClick(deviceGroup.name)">
                      <i class="fas fa-folder icon-with-space"></i> {{ deviceGroup.name }}
                    </button>
                    <br><br>
                    <div class="row">
                      <div class="col-md-6" v-for="(device, deviceIndex) in deviceGroup.devices" :key="deviceIndex">
                        <!-- Apply circular container to the div element -->
                        <div class="circular-div mb-4">
                          <i class="fas fa-cogs icon-with-space"></i> {{ device }}
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
      deviceGroup: '',
      deviceGroups: [
        { name: '设备组A', devices: ['主设备A', '子设备A'] },
        { name: '设备组B', devices: ['主设备B', '子设备B'] },
        { name: '设备组C', devices: ['主设备C', '子设备C'] },
        { name: '设备组D', devices: ['主设备D', '子设备D'] }
      ]
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
    ButtonClick(groupName){
      this.deviceGroup = groupName;
      this.$emit('select-item', {deviceGroup: this.deviceGroup});
    }
  },
};
</script>

<style>
  .icon-with-space {
    margin-right: 5px;
  }

  .device-group-space {
    border: 1px solid #ccc;
    padding: 20px; 
  }

  .tree-node {
    list-style-type: none;
    padding-left: 20px;
  }

  .tree-node:before {
    content: "";
    position: absolute;
    top: 0;
    left: -15px;
    border-left: 1px solid #ccc;
    height: 100%;
  }

  .tree-node:first-child:before {
    border: none;
  }

  .circular-btn,
  .circular-div {
    width: 150px;
    height: 100px;
    border-radius: 50%;
    background-color: #007bff;
    color: #fff;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    margin-bottom: 10px;
    position: relative;
  }

  .circular-btn:hover {
    background-color: #0056b3;
  }
</style>
